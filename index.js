// index.js
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const expressFileUpload = require("express-fileupload");
const path = require("path");
const secretKey = "1234";
const axios = require("axios");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo y escuchando por el puerto ${PORT}!`);
});

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// importamos funciones desde consultas
const {
  getSkaters,
  registrarSkater,
  estadoSkater,
  loginSkater,
  updateSkater,
  deleteSkater,
} = require("./consultas/consultas");

// creamos carpeta publica para subir archivos
app.use(express.static(__dirname + "/assets"));

// limitamos el tamaño de archivos que se pueden subir
app.use(
  expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el límite permitido",
  })
);

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/main`,
  })
);
app.set("view engine", "handlebars");

// Rutas de la aplicación
app.get("/", async (req, res, next) => {
  try {
    const result = await getSkaters();
    // console.log("Valor de result: ", result);
    res.render("Home", { skaters: result });
  } catch (error) {
    next(error);
  }
});
// API REST para loguear skaters
app.get("/login", (req, res) => {
  res.render("Login");
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Valor de req.body: ", req.body);
  const skater = await loginSkater(email, password);
  console.log("Valor de skaters: ", skater);
  try {
    if (skater) {
      const token = jwt.sign(skater, secretKey, { expiresIn: '2m' });
      res.redirect(`/datos?token=${token}`);
      console.log("token: ", token);
    } else {
      res.status(401).send('No se ha podido ingresar');
    }
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500
    })
  }
});

app.get("/registro", (req, res) => {
  res.render("Registro");
});

app.get('/datos', (req, res) => {
  let { token } = req.query;
  jwt.verify(token, secretKey, (err, skater) => {
    const data = skater;
    if (err) {
      res.status(401).json({
        error: "401 Unauthorized",
        message: err.message,
      });
    } else {
      res.render('Datos', data);
    }
  });

});


app.get('/admin', async (req, res) => {
  try {
    const result = await getSkaters();
    res.render('Admin', { skaters: result });
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500
    })
  }
});

// API REST para registro de skaters
app.post("/registro", async (req, res) => {
  const { email, nombre, password, password2, anos_experiencia, especialidad } =
    req.body;
  const { foto } = req.files;
  const { name } = foto;

  try {
    await registrarSkater(
      email,
      nombre,
      password,
      anos_experiencia,
      especialidad,
      name
    );

    if (!foto) {
      return res.status(400).send("No se ha adjuntado foto de perfil");
    }

    foto.mv(path.join(__dirname, "assets", "uploads", name), (err) => {
      if (err) {
        return res.status(500).send(err);
      }

      // Redirigir al usuario después de un registro exitoso
      res
        .status(200)
        .send(
          '<script>alert("Se ha registrado con éxito."); window.location.href = "/"; </script>'
        );
    });
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});
// Ruta para actualizar datos de un skater
app.post('/actualizar', async (req, res) => {
  console.log("Valor de req.body: ", req.body);
  let { email, nombre, password, anos_experiencia, especialidad } = req.body;
  try {
    await updateSkater(email, nombre, password, anos_experiencia, especialidad);
    res.send('<script>alert("Datos actualizados con éxito."); window.location.href = "/"; </script>');
  } catch (error) {
    res.status(500).send(`Error en actualización de datos. ${error}`)
  }
});

// Ruta eliminar un skater
app.delete('/skater', async (req, res) => {
  try {
    const { id } = req.query;
    await deleteSkater(id);
    res.status(200).send(`<script>alert("La cuenta con ${id} ha sido eliminada con éxito."); window.location.href = "/"; </script>`);
  } catch (e) {
    return res.status(500).send({
      error: `Algo salió mal... ${e.message}`,
      code: 500
    })
  };
});

app.put("/skater/status/:id", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  console.log("Valor recibido en body: ", estado);
  try {
    const skater = await estadoSkater(id, estado);
    res.status(200).send(JSON.stringify(skater));
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});
