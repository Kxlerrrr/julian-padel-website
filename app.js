const { createApp, ref, onMounted, computed } = Vue;

createApp({
    setup() {
        const darkMode = ref(true); 
        const lang = ref('nl');
        const showAuthModal = ref(false);
        const twoFactorStep = ref(false);
        const authMode = ref('login'); 
        const user = ref(null);
        const notification = ref(null);
        const today = new Date().toISOString().split('T')[0];
        
        const loadingReviews = ref(true);
        const activeReviewIndex = ref(0);
        const reviews = ref([
            { auteur: "Sander de Jong", titel: "Geweldige bandeja techniek!", tekst: "Julian legt de tactiek achter padel super helder uit. Mijn bandeja is na 2 lessen al direct verbeterd.", score: 5, datum: "14 Juni 2026" },
            { auteur: "Anouk van Dijk", titel: "Super leuke jeugdlessen", tekst: "Mijn zoon van 11 traint bij de Kids Academy. Julian brengt zoveel energie en plezier mee op de baan.", score: 5, datum: "02 Juni 2026" },
            { auteur: "Pieter Meijer", titel: "Top clinic voor ons bedrijf", tekst: "Met 24 man een clinic gedaan inclusief afsluitend toernooi. Alles was tot in de puntjes strak geregeld.", score: 5, datum: "22 Mei 2026" }
        ]);

        const customerForm = ref({ name: '', email: '', phone: '' });
        const bookingForm = ref({ date: '', slot: '', rentRacket: false, lessonType: 'privé', level: 'beginner', partners: '' });
        const cart = ref([]);
        const authForm = ref({ name: '', email: '', password: '' });
        const clinicForm = ref({ company: '', name: '', email: '', players: '8 - 12 personen', month: '' });
        const kidsForm = ref({ childName: '', childAge: '', preferredDay: 'Woensdag', parentEmail: '' });
        const availableSlots = ref([]);

        const mockDashboard = ref({
            ritten: 7,
            boeking: 'Woensdag 24 Juni om 19:00 uur',
            videos: [
                { titel: 'Techniek: Kick-smash placement', datum: '12 Mei 2026' },
                { titel: 'Positiespel: Defensief glasgebruik', datum: '02 Juni 2026' }
            ]
        });

        const lesPrijzen = { 'privé': 80, 'duo': 40, 'groep': 20 };

        const isCustomerFormValid = computed(() => {
            return customerForm.value.name.trim() !== '' && 
                   customerForm.value.email.trim() !== '' && 
                   customerForm.value.phone.trim() !== '';
        });

        const addLessonToCart = () => {
            const basisPrijs = lesPrijzen[bookingForm.value.lessonType] || 80;
            const racketPrijs = bookingForm.value.rentRacket ? 5 : 0;
            cart.value.push({
                date: bookingForm.value.date,
                slot: bookingForm.value.slot,
                lessonType: bookingForm.value.lessonType,
                level: bookingForm.value.level,
                partners: bookingForm.value.partners,
                rentRacket: bookingForm.value.rentRacket,
                price: basisPrijs + racketPrijs
            });
            triggerNotification("Les toegevoegd aan winkelwagen!");
            bookingForm.value.slot = '';
        };

        const removeLessonFromCart = (index) => {
            cart.value.splice(index, 1);
            triggerNotification("Les verwijderd.");
        };

        const totaleCartPrijs = computed(() => {
            return cart.value.reduce((total, item) => total + item.price, 0);
        });

        const tarieven = [
            { titel: "Privé Training", prijs: "€ 80,00", beschrijving: "1-op-1 intensieve focus op techniek en tactiek." },
            { titel: "Duo Training", prijs: "€ 40,00", beschrijving: "Train met je vaste partner op positiespel (p.p.)." },
            { titel: "Groepstraining", prijs: "€ 20,00", beschrijving: "Wedstrijdsituaties nabootsen met 4 personen (p.p.)." },
            { titel: "Kids Junior Groep", prijs: "€ 15,00", beschrijving: "Gezellige woensdag- of zaterdagtraining (p.p.)." }
        ];

        const rittenkaarten = [
            { titel: "4-Lessen", sub: "Voor de regelmatige speler", prijs: "€ 305,-", besparing: "Bespaar tot wel 5%", popular: false },
            { titel: "8-Lessen", sub: "Voor de die-hard padeller", prijs: "€ 575,-", besparing: "Bespaar tot wel 10%", popular: true }
        ];

        const translations = {
            nl: {
                'nav.book': 'Plan een Les', 'nav.rates': 'Tarieven', 'nav.contact': 'Contact',
                'hero.cta': 'Boek Nu Een Padelles', 'booking.title': 'Online Agenda & Reserveringen', 'auth.login': 'Inloggen'
            },
            en: {
                'nav.book': 'Book a Lesson', 'nav.rates': 'Rates', 'nav.contact': 'Contact',
                'hero.cta': 'Book Padel Lesson Now', 'booking.title': 'Online Calendar & Bookings', 'auth.login': 'Login'
            }
        };

        const t = (key) => translations[lang.value][key] || key;

        const toggleDarkMode = () => {
            darkMode.value = !darkMode.value;
            document.documentElement.classList.toggle('dark', darkMode.value);
        };

        const toggleLanguage = () => {
            lang.value = lang.value === 'nl' ? 'en' : 'nl';
        };

        const generateSlots = () => {
            const uren = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "14:00 - 15:00", "19:00 - 20:00", "20:00 - 21:00"];
            availableSlots.value = uren.map(tijd => ({
                time: tijd,
                available: Math.random() > 0.2
            }));
        };

        const triggerNotification = (msg) => {
            notification.value = msg;
            setTimeout(() => notification.value = null, 4000);
        };

        const nextReview = () => activeReviewIndex.value = (activeReviewIndex.value + 1) % reviews.value.length;
        const prevReview = () => activeReviewIndex.value = (activeReviewIndex.value - 1 + reviews.value.length) % reviews.value.length;

        const handleAuthClick = () => {
            if (user.value) {
                document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
            } else {
                authMode.value = 'login';
                showAuthModal.value = true;
            }
        };

        const handleAuthSubmit = () => {
            if (authMode.value === 'login') {
                twoFactorStep.value = true;
            } else {
                user.value = { name: authForm.value.name || 'Nieuwe Speler' };
                localStorage.setItem('padel_user', JSON.stringify(user.value));
                showAuthModal.value = false;
                triggerNotification("Account aangemaakt!");
            }
        };

        const simulateLogin = () => {
            user.value = { name: authForm.value.email.split('@')[0] || "Martijn" };
            localStorage.setItem('padel_user', JSON.stringify(user.value));
            showAuthModal.value = false;
            twoFactorStep.value = false;
            triggerNotification("Succesvol ingelogd via 2FA!");
        };

        const logout = () => {
            user.value = null;
            localStorage.removeItem('padel_user');
            triggerNotification("Je bent uitgelogd.");
        };

        const handleCheckout = (type, detail = '') => {
            triggerNotification("Stripe Gateway wordt opgestart...");
            setTimeout(() => {
                alert(`GitHub Test Mode - Betalingsverzoek geslaagd!\nType: ${type} ${detail}\nTotaalbedrag: €${type === 'les' ? totaleCartPrijs.value : 'bedrag'},00`);
                if(type === 'les') cart.value = [];
            }, 1000);
        };

        const handleClinicRequest = () => {
            alert(`Offerteaanvraag ontvangen voor ${clinicForm.value.company}! We nemen snel contact op.`);
            clinicForm.value = { company: '', name: '', email: '', players: '8 - 12 personen', month: '' };
        };

        const handleKidsRegister = () => {
            alert(`Aanmelding voor ${kidsForm.value.childName} succesvol ontvangen!`);
            kidsForm.value = { childName: '', childAge: '', preferredDay: 'Woensdag', parentEmail: '' };
        };

        onMounted(() => {
            setTimeout(() => loadingReviews.value = false, 800);
            document.documentElement.classList.add('dark');
            
            // Check bestaande sessie
            const savedUser = localStorage.getItem('padel_user');
            if (savedUser) user.value = JSON.parse(savedUser);

            setInterval(() => { if (!loadingReviews.value) nextReview(); }, 6000);
        });

        return {
            darkMode, toggleDarkMode, lang, toggleLanguage, t,
            customerForm, bookingForm, cart, authForm, clinicForm, kidsForm, today, availableSlots, generateSlots, 
            addLessonToCart, removeLessonFromCart, handleCheckout, handleClinicRequest, handleKidsRegister, totaleCartPrijs, isCustomerFormValid,
            tarieven, rittenkaarten, showAuthModal, twoFactorStep, authMode, handleAuthClick, handleAuthSubmit, simulateLogin, logout, user, notification, mockDashboard,
            loadingReviews, activeReviewIndex, reviews, nextReview, prevReview
        };
    }
}).mount('#app');