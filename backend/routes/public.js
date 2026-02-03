import express from 'express';
import { Heart, ShieldCheck, CalendarCheck, ArrowRight, Sparkles, Users, Star, PhoneCall, Laptop, Compass, Smile } from 'lucide-react';

const router = express.Router();

// Static data that was previously in Landing.jsx, now living on the backend
const staticData = {
    stats: [
        { label: 'Students supported', value: '1.5k+' },
        { label: 'Counsellor sessions / month', value: '900+' },
        { label: 'Avg. response time', value: '<4 min' },
        { label: 'Data security score', value: 'A+' }
    ],
    features: [
        {
            title: 'Integrated care workspace',
            description: 'Bookings, notes, and asynchronous chat live inside one secure pane.',
            icon: 'Laptop' 
        },
        {
            title: 'Role-aware experiences',
            description: 'Students, counsellors, and admins see the workflows that matter to them.',
            icon: 'Users' 
        },
        {
            title: 'Clinical-grade privacy',
            description: 'Audit trails, RBAC, and encryption keep sensitive data safe.',
            icon: 'ShieldCheck' 
        }
    ],
    journey: [
        {
            title: 'Screen & triage',
            description: 'Smart intake surveys highlight red flags before escalation.',
            icon: 'Sparkles'
        },
        {
            title: 'Match & schedule',
            description: 'Students match with counsellors and self-book in seconds.',
            icon: 'CalendarCheck'
        },
        {
            title: 'Care & measure',
            description: 'Sessions, resources, and follow-up tasks stay connected.',
            icon: 'Heart'
        }
    ],
    testimonials: [
        {
            quote:
                '“DPI feels like a digital safety net. Students check in early, and our team can monitor sentiment all semester.”',
            name: 'Dr. Elaine Jacobs',
            role: 'Head of Counselling, Northwind University'
        },
        {
            quote:
                '“Booking therapy used to be intimidating. DPI made it as easy as reserving a study room—and responses are instant.”',
            name: 'Leo Martins',
            role: 'Final-year Computer Science student'
        }
    ],
    faqs: [
        {
            question: 'How do I get campus data into DPI?',
            answer: 'Connect your SIS export or CSV during onboarding. Our success team helps you safely migrate user data.',
            icon: 'Compass'
        },
        {
            question: 'Can we customise the care pathways?',
            answer:
                'Yes. Admins can configure focus areas, add crisis escalation rules, and tailor booking forms per counsellor.',
            icon: 'Compass'
        },
        {
            question: 'Does DPI work with our existing helpline?',
            answer:
                'Absolutely. Plug in hotline numbers, WhatsApp lines, or third-party tele-health vendors so students always reach help.',
            icon: 'Compass'
        }
    ]
};

// GET /api/public/stats
router.get('/stats', (req, res) => {
    res.json({ success: true, data: { stats: staticData.stats } });
});

// GET /api/public/features
router.get('/features', (req, res) => {
    res.json({ success: true, data: { features: staticData.features } });
});

// GET /api/public/journey
router.get('/journey', (req, res) => {
    res.json({ success: true, data: { journey: staticData.journey } });
});

// GET /api/public/testimonials
router.get('/testimonials', (req, res) => {
    res.json({ success: true, data: { testimonials: staticData.testimonials } });
});

// GET /api/public/faqs
router.get('/faqs', (req, res) => {
    res.json({ success: true, data: { faqs: staticData.faqs } });
});

export default router;