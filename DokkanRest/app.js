
const express = require('express')
const redis = require('redis')


const connectDB = require('./configuracion/database')
const setupSwagger = require('./configuracion/swagger')


const cards = require('./routes/cards')


const index = require('./middleware/index')
const notFound = require('./middleware/notFound')

const app = express()
app.use(express.json())


connectDB()


  // Inicializar Swagger
  setupSwagger(app)

  // Definir rutas
  app.get("/", index)
  app.use("/cards", cards)
  app.use(notFound)
  
  // Iniciar el servidor
  const port = 3000
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })


