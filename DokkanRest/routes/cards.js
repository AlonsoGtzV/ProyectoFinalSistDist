const express = require('express')
const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const cards = express.Router()
const Pettan = require('../schema/pettan')


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del usuario.
 *         nombre:
 *           type: string
 *           description: Nombre del usuario.
 *         level:
 *           type: integer
 *           description: Lv del usuario.
 *         powerlevel:
 *           type: integer
 *           description: PowerLevel del usuario.
 *         pettanId:
 *           type: string
 *           description: ID de la carta Pettan que tiene el usuario.
 *      Pettan:
 *       type: object
 *       properties:
 *         user_id:
 *           type: number
 *           description: ID del usuario que posee la carta Pettan. 
 *         id:
 *           type: number
 *           description: ID único de la carta Pettan.
 *         num:
 *           type: string
 *           description: Número de la carta Pettan.
 *         name:
 *           type: string
 *           description: Nombre de la carta Pettan.
 *         type:
 *           type: string
 *           description: Tipos de la carta Pettan.
 *         rarity:
 *           type: string
 *           description: Rareza de la carta Pettan.
 *         series:
 *           type: string
 *           description: Serie de la carta Pettan.
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: Información del usuario ligado a la cuenta Dokkan.
 */


/**
 * @swagger
 * /Cards:
 *   get:
 *     summary: Obtener todos las Cartas Pettan
 *     description: Retorna una lista paginada de todas las cartas Pettan registradas.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Número de página (por defecto: 1)."
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 4
 *         description: "Cantidad de resultados por página (por defecto: 4)."
 *     responses:
 *       200:
 *         description: Lista de Cartas Pettan con paginación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPettans:
 *                   type: integer
 *                   description: "Número total de Cartas Pettan."
 *                 totalPages:
 *                   type: integer
 *                   description: "Número total de páginas."
 *                 currentPage:
 *                   type: integer
 *                   description: "Página actual."
 *                 pettans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pettan'
 *       500:
 *         description: Error interno del servidor.
 */

cards.get('/', async (req, res) => {
    const { page = 1, limit = 4 } = req.query;
    const cacheKey = `pettans:page:${page}:limit:${limit}`

    try {
        const cachedPettans = await redisClient.get(cacheKey); 

        if (cachedPettans) {
            return res.json(JSON.parse(cachedPettans)); 
        }

        const pettans = await Pettan.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Pettan.countDocuments();

        const result = {
            totalPettans: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            pettans
        };

        await redisClient.set(cacheKey, JSON.stringify(result), {
            EX: 10
        });

        res.json(result);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @swagger
 * /cards/name/{name}:
 *   get:
 *     summary: Buscar una carta Pettan por su nombre
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Se busca una carta Pettan por su nombre exacto.
 *     responses:
 *       200:
 *         description: A single Card
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pettan'
 *       404:
 *         description: Card not found
 */

cards.get('/name/:name', async (req, res) => {
    try {
        const pettan = await Pettan.findOne({ name: req.params.name });
        if (!pettan) {
            return res.status(404).json({ message: 'Pettan not found' });
        }
        res.json(pettan);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @swagger
 * /cards/{id}:
 *   get:
 *     summary: Obtener una Carta Pettan por su ID
 *     description: Retorna una Carta Pettan específica de la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: El ID de la Carta Pettan.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Retorna la Carta Pettan solicitada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pettan'
 *       404:
 *         description: No se encontró la carta Pettan.
 *       500:
 *         description: Error interno del servidor.
 */

cards.get('/:id', async (req, res) => {
    try {
        const pettan = await Pettan.findById(req.params.id)
        if (!pettan) {
            return res.status(404).json({ error: 'Card not found' }); 
        }

        const userId = pettan.user_id;

        const soapRequest = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="user.soap.api">
            <soapenv:Header/>
            <soapenv:Body>
                <tns:GetUser>
                    <tns:id>${userId}</tns:id>
                </tns:GetUser>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    const response = await axios.post(
        'http://soap-api:5000/soap', 
        soapRequest,
        {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
            },
        }
    );

    const xmlResponse = response.data;
        console.log('Respuesta XML:', xmlResponse);

        const parsedData = await parseStringPromise(xmlResponse, {
            explicitArray: false, 
            tagNameProcessors: [(name) => name.replace(/.*:/, '')], 
        });

        const userData = parsedData.Envelope.Body.GetUserResponse.GetUserResult;

        const combinedResult = {
            pettan,
            user: userData,
        };
        res.json(combinedResult);
         } catch (error) {
        console.error('Error en la conexion con la Api:', error.message);
        res.status(500).json({ error: 'Server error' });
    }

});


/**
 * @swagger
 * /cards/type/{type}:
 *   get:
 *     summary: Buscar Carta  por tipo
 *     description: Obtiene una lista de las cartas Pettan filtrados por tipo
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: "Tipo de carta Pettan a buscar (AGL, TEQ, INT, STR Y PHY)."
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Número de página (por defecto: 1)."
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 4
 *         description: "Cantidad de resultados por página (por defecto: 4)."
 *     responses:
 *       200:
 *         description: "Lista de cartas Pettan filtradas por tipo con paginación."
 *       500:
 *         description: "Error interno del servidor."
 */

cards.get('/type/:type', async (req, res) => {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const cacheKey = `pettans:${type}:page:${page}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData)); 
        }

        const pettans = await Pettan.find({ type })
            .skip(skip)
            .limit(limit);

        await redisClient.setEx(cacheKey, 600, JSON.stringify(pettans));

        res.json(pettans);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Agregar una nueva carta Pettan
 *     description: Crea una nueva carta Pettan en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pettan'
 *     responses:
 *       200:
 *         description: Carta Pettan creada exitosamente.
 *       500:
 *         description: Error interno del servidor.
 */

cards.post('/', async (req, res) => {
    try {
        const lastPettan = await Pettan.findOne().sort({ id: -1 });

        const nextId = lastPettan ? lastPettan.id + 1 : 1; 
        const nextNum = lastPettan ? (parseInt(lastPettan.num) + 1).toString().padStart(3, '0') : '001'; 

        const {
            user_id,
            name, 
            type, 
            rarity,
            series
        } = req.body;

        const pettan = new Pettan({
            id: nextId, 
            num: nextNum,
            user_id,
            name,
            type,
            rarity,
            series

        });

        await pettan.save();

        res.json({ success: true, pettan }); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @swagger
 * /cards/user:
 *   post:
 *     summary: Crear un nuevo user.
 *     description: Crea un user en la soap.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: El username del user.
 *                 example: 
 *               level:
 *                 type: integer
 *                 description: El nivel del user.
 *                 example: 777
 *               Powerlevel:
 *                 type: integer
 *                 description: El nivel de poder dell user.
 *                 example: 100000000
 *               card_id:
 *                 type: string
 *                 description: ID de la carta asociada al user (opcional).
 *                 example: 1
 *     responses:
 *       201:
 *         description: User creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully.
 *                 user:
 *                   type: object
 *                   description: Usuario creado.
 *       400:
 *         description: Solicitud inválida (Revisa los campos que esten llenados correctamente).
 *       500:
 *         description: Error interno del servidor.
 */


cards.post('/user', async (req, res) => {
    const { username, level, powerlevel, card_id } = req.body;

    if (!username || !level) {
        return res.status(400).json({ error: 'Llena los campo correctamente' });
    }

    try {
        // Construir la solicitud SOAP para crear un usuario
        const soapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="user.soap.api">
                <soapenv:Header/>
                <soapenv:Body>
                    <tns:PostUser>
                        <tns:username>${username}</tns:username>
                        <tns:level>${level}</tns:level>
                        <tns:card_id>${card_id || ''}</tns:card_id>
                    </tns:PostUser>
                </soapenv:Body>
            </soapenv:Envelope>
        `;


        const response = await axios.post(
            'http://soap-api:5000/soap', 
            soapRequest,
            {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                },
            }
        );

        const xmlResponse = response.data;
        console.log('Respuesta XML:', xmlResponse);

        const parsedData = await parseStringPromise(xmlResponse, {
            explicitArray: false, 
            tagNameProcessors: [(name) => name.replace(/.*:/, '')], 
        });

        const userResult = parsedData.Envelope.Body.PostUserResponse.PostUserResult;

        // Devolver la respuesta procesada al cliente
        res.status(201).json({ message: 'User creado exitosamente', user: userResult });
    } catch (error) {
        console.error('Error con la DokkanSoap:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /cards/{id}:
 *   put:
 *     summary: Actualizar una carta Pettan por ID
 *     description: Actualiza una carta Pettan existente en la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la carta Pettan a actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pettan'
 *     responses:
 *       200:
 *         description: Carta Pettan actualizada exitosamente.
 *       404:
 *         description: Carta Pettan no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */

cards.put('/:id', async (req, res) => {
    try {
        const pettan = await Pettan.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!pettan) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.json({ success: true, updatedPettan: pettan });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /cards/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una carta Pettan por ID
 *     description: Permite actualizar parcialmente una carta Pettan existente en la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la carta Pettan a actualizar.
 *         schema:
 *           type: string
*     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pettan'
 *     responses:
 *       200:
 *         description: Carta Pettan actualizado exitosamente.
 *       404:
 *         description: Carta Pettan no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */

cards.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const pettan = await Pettan.findByIdAndUpdate(req.params.id, updates, { new: true });

        if (!pettan) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.json({ success: true, updatedPettan: pettan });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /cards/{id}:
 *   delete:
 *     summary: Eliminar una carta Pettan por ID
 *     description: Elimina una carta Pettan existente en la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la carta Pettan a eliminar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carta Pettan eliminada exitosamente.
 *       404:
 *         description: Carta Pettan no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */

cards.delete('/:id', async (req, res) => {
    try {
        const pettan = await Pettan.findByIdAndDelete(req.params.id);
        if (!pettan) {
            return res.status(404).json({ error: 'Card not found' }); 
        }
        res.json({ success: true, message: 'PettanCard deleted successfully', pettan });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = cards
