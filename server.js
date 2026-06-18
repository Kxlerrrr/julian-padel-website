const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_51AzXXXXXX'); // Vervang dit door je echte Stripe Secret Key indien nodig

const app = express();
app.use(cors());
app.use(express.json());

// GEWIJZIGD: Je Gmail-adres waar de notificaties naar binnen moeten komen
const ACADEMY_EMAIL = 'testpadelwebsite@gmail.com'; 

// Tijdelijke opslag in het geheugen voor verificatiecodes en boekingen
const verificationCodes = {}; 
const customerBookings = {
    "test@example.com": [
        { id: 1, date: "2026-07-10", time: "19:00", type: "Padel Training - Gevorderd" }
    ]
}; 

// =========================================================================
// CONFIGURATIE: E-mail Transporteur aangepast naar GMAIL
// =========================================================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true voor poort 465 (SSL)
    auth: {
        user: 'testpadelwebsite@gmail.com', // Vul hier je Gmail-adres in
        pass: 'dglu dncu coyx hpvm' // PLAK HIER HET GEGENEREERDE GOOGLE APP-WACHTWOORD (16 letters zonder spaties)
    }
});

// --- FUNCTIE: Genereer Factuur HTML ---
function generateInvoiceHTML(customer, cart, totalAmount, invoiceNumber) {
    let itemsHtml = '';
    cart.forEach(item => {
        itemsHtml += `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.isSeries ? item.weeks + '-Weken Reeks' : 'Losse Les'} (${item.lessonType})</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.date} om ${item.slot}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">€${item.price},00</td>
        </tr>`;
    });

    return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee;">
        <h2 style="color: #9EF01A; background: black; padding: 10px; text-align: center; border-radius: 5px;">PAW - OFFICIELE FACTUUR</h2>
        <p><strong>Factuurnummer:</strong> ${invoiceNumber}</p>
        <p><strong>Datum:</strong> ${new Date().toLocaleDateString('nl-NL')}</p>
        <br>
        <h4>Klantgegevens:</h4>
        <p>${customer.name}<br>${customer.email}<br>${customer.phone}</p>
        <br>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
                <tr style="background: #f5f5f5;">
                    <th style="padding: 10px;">Omschrijving</th>
                    <th style="padding: 10px;">Datum / Tijdstip</th>
                    <th style="padding: 10px; text-align: right;">Prijs</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
        </table>
        <h3 style="text-align: right; margin-top: 20px;">Totaal voldaan: €${totalAmount},00</h3>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 11px; color: #777; text-align: center;">Cuchilla Padel Academy - KVK: 12345678 - Bedankt voor je boeking!</p>
    </div>`;
}

// =========================================================================
// 1. BEDRIJFSCLINIC VERZOEKEN
// =========================================================================
app.post('/api/forms/clinic', async (req, res) => {
    const { company, name, email, phone, message } = req.body;

    const mailOptions = {
        from: `"Cuchilla Padel Academy" <${transporter.options.auth.user}>`, // Dynamisch gekoppeld aan je Gmail-adres
        to: ACADEMY_EMAIL,
        subject: `Nieuwe Offerteaanvraag Bedrijfsclinic: ${company}`,
        html: `
        <div style="font-family: sans-serif; padding: 25px; line-height: 1.6; border-left: 5px solid #9EF01A; background-color: #fafafa;">
            <h2 style="color: #111;">Nieuwe Bedrijfsclinic Aanvraag</h2>
            <p>Er is een nieuwe offerteaanvraag binnengekomen via het online formulier:</p>
            <table style="text-align: left; border-collapse: collapse;">
                <tr><th style="padding: 5px 15px 5px 0;">Bedrijf:</th><td><strong>${company}</strong></td></tr>
                <tr><th style="padding: 5px 15px 5px 0;">Contactpersoon:</th><td>${name}</td></tr>
                <tr><th style="padding: 5px 15px 5px 0;">E-mailadresse:</th><td><a href="mailto:${email}">${email}</a></td></tr>
                <tr><th style="padding: 5px 15px 5px 0;">Telefoonnummer:</th><td>${phone}</td></tr>
            </table>
            <br>
            <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <strong>Aanvullend bericht/wensen:</strong><br>
                <p style="white-space: pre-line;">${message || 'Geen extra opmerkingen ingevoerd.'}</p>
            </div>
        </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Aanvraag succesvol verzonden!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 2. KIDS ACADEMY REGISTRATIE
// =========================================================================
app.post('/api/forms/kids', async (req, res) => {
    const { parentName, phone, email, childName, childAge, preferredDay } = req.body;

    const mailOptions = {
        from: `"Cuchilla Padel Academy" <${transporter.options.auth.user}>`,
        to: ACADEMY_EMAIL,
        subject: `Nieuwe Aanmelding Kids Academy: ${childName}`,
        html: `
        <div style="font-family: sans-serif; padding: 25px; line-height: 1.6; border-left: 5px solid #3b82f6; background-color: #f8fafc;">
            <h2 style="color: #1e3a8a;">Aanmelding Kids Academy ontvangen!</h2>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
            <h3>Gegevens Ouder:</h3>
            <p><strong>Naam:</strong> ${parentName}<br><strong>Telefoon:</strong> ${phone}<br><strong>E-mail:</strong> ${email}</p>
            <h3>Gegevens Kind:</h3>
            <p><strong>Naam Kind:</strong> ${childName}<br><strong>Leeftijd:</strong> ${childAge} jaar<br><strong>Voorkeursdag/groep:</strong> ${preferredDay}</p>
        </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Kids aanmelding verwerkt" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// 3. KLANTENPANEEL AUTH SYSTEM (Inlogcode aanvragen & verifiëren)
// =========================================================================
app.post('/api/auth/request-code', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "E-mail is verplicht" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 }; 

    const mailOptions = {
        from: `"Cuchilla Padel Academy" <${transporter.options.auth.user}>`,
        to: email,
        subject: `🔒 Jouw 2FA Verificatiecode: ${code}`,
        html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; text-align: center; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
            <h2>Beveiligd Inloggen Spelers Portaal</h2>
            <p>Gebruik de onderstaande 6-cijferige code om veilig in te loggen in je klantenpaneel.</p>
            <div style="font-size: 32px; font-weight: bold; background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px; color: #111;">${code}</div>
            <p style="font-size: 12px; color: #999;">Deze code is 10 minuten geldig.</p>
        </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Code succesvol verzonden!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body;
    const record = verificationCodes[email];

    if (record && record.code === code && record.expires > Date.now()) {
        delete verificationCodes[email]; 
        const lessons = customerBookings[email] || [];
        return res.status(200).json({ success: true, lessons });
    }
    res.status(400).json({ success: false, message: "Code is onjuist of verlopen." });
});

// =========================================================================
// 4. AUTOMATISCH BETAALSYSTEEM & FACTURATIE (Stripe)
// =========================================================================
app.post('/api/checkout/create-session', async (req, res) => {
    const { customer, cart, totalAmount } = req.body;

    try {
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: `${item.isSeries ? item.weeks + '-Weken Reeks' : 'Losse Les'} (${item.lessonType})`,
                    description: `Datum/Start: ${item.date} - Tijdstip: ${item.slot}. Niveau: ${item.level}`,
                },
                unit_amount: item.price * 100, 
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'ideal'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: customer.email,
            success_url: `${req.headers.origin}?success=true`,
            cancel_url: `${req.headers.origin}?cancel=true`,
            metadata: {
                customerName: customer.name,
                customerPhone: customer.phone,
                cartData: JSON.stringify(cart)
            }
        });

        if(!customerBookings[customer.email]) customerBookings[customer.email] = [];
        cart.forEach(item => customerBookings[customer.email].push(item));

        const invNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
        const invoiceHtml = generateInvoiceHTML(customer, cart, totalAmount, invNumber);
        
        await transporter.sendMail({
            from: `"Cuchilla Padel Academy" <${transporter.options.auth.user}>`,
            to: customer.email,
            subject: `📄 Factuur & Boekingsbevestiging ${invNumber} - Cuchilla Padel Academy`,
            html: invoiceHtml
        });

        res.json({ id: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5500;
app.listen(PORT, () => console.log(`🚀 Padel backend server draait perfect op poort ${PORT}!`));