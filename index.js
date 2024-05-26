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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Email recibido:", email); 
  console.log("Contraseña recibida:", password); 

  try {
    const token = await loginSkater(email, password); 
    console.log("Token generado:", token);
    if (token) {
      res.redirect(`/datos?token=${token}`);
    } else {
        res.status(401).send("Credenciales incorrectas");
    }
  } catch (error) {
    console.error("Error en el login:", error); 
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});

app.get("/registro", (req, res) => {
  res.render("Registro");
});

app.get("/perfil", (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).send("Acceso no autorizado");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    res.render("Perfil", { email: decoded.email });
  } catch (error) {
    return res.status(401).send("Token inválido o expirado");
  }
});


app.get("/admin", async (req, res) => {
  const result = await getSkaters();
  res.render("Admin", { skaters: result });
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
