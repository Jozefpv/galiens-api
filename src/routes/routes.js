const express = require('express')
const router = express.Router()
const {db} = require('../controllers/firebase.js')

router.post('/users', async (req, res) => {
    const { points, wallet } = req.body;

    // Validar que wallet tenga entre 16 y 32 letras
    if (!isValidWallet(wallet)) {
        return res.status(400).json({ error: 'El formato de la wallet no es válido' });
    }

    const userRef = db.collection('users').doc(wallet);
    await userRef.set(
      {
        id: wallet,
        points: points
      },
      { merge: true }
    );

    res.status(201).json({ id: wallet, points: points, message: 'Usuario creado o actualizado exitosamente' });

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