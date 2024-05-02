const express = require('express')
const router = express.Router()
const {db} = require('../controllers/firebase.js')

router.post('/users', async (req, res) => {
    const { points, wallet } = req.body;

    if (!isValidWallet(wallet)) {
        return res.status(400).json({ error: 'El formato de la wallet no es válido' });
    }

    const validatedPoints = Math.max(0, points);

    const userRef = db.collection('users').doc(wallet);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.data();

    if (!userData || points > (userData.points || 0)) {
        await userRef.set(
            {
                id: wallet,
                points: points
            },
            { merge: true }
        );

        res.status(201).json({ id: wallet, points: points, message: 'Usuario creado o actualizado exitosamente' });
    } else {
        res.status(400).json({ error: 'Los puntos proporcionados no son mayores que los puntos actuales del usuario' });
    }
});

function isValidWallet(wallet) {
    const regex = /^[a-zA-Z0-9]{30,50}$/; 
    return regex.test(wallet);
}

router.get('/ranking', async (req, res) => {
    try {
        const rankingRef = db.collection('users');
        const snapshot = await rankingRef.get();

        if (snapshot.empty) {
            return res.status(404).json({ mensaje: 'No hay usuarios en la colección' });
        }

        const ranking = [];

        snapshot.forEach((doc) => {
            const userData = doc.data();

            const user = {
                id: userData.id,
                points: userData.points || 0, 
            };

            ranking.push(user);
        });

        ranking.sort((a, b) => b.points - a.points);

        res.status(200).json({ ranking });
    } catch (error) {
        console.error('Error al obtener ranking:', error);
        res.status(500).json({ mensaje: 'Error en la API' });
    }
});

module.exports = router