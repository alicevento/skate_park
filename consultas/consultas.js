//consultas.js
const pkg = require('pg');
// const { dotenv } = require('dotenv');
// dotenv.config();
const { Pool } = pkg;
const jwt = require("jsonwebtoken");
const secretKey = "1234";
const manejoErrores = require('../errores/manejoErrores');

const pool = new Pool({
    user: "alice",
    host: "localhost",
    database: "skatepark",
    password: "Camila",
    port: 5433
});

// Función para obtener todos los skaters
const getSkaters = async () => {
    const consulta = {
        text: "SELECT * FROM skaters",
        values: []
    }
    try {
        const result = await pool.query(consulta);
        return result.rows;
    } catch (error) {
        throw error;
        console.log("Error: " + error.code);
    }
};
// Función para registrar un skater
const registrarSkater = async (email, nombre, password, anos_experiencia, especialidad, foto) => {
    try {
        const consulta = {
            text: "INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *",
            values: [email, nombre, password, anos_experiencia, especialidad, foto]
        };
        const result = await pool.query(consulta);
        return result.rows[0];
    } catch (error) {
        console.log("Error: " + error);
    }
}

const estadoSkater = async (id, estado) => {
    try {
        const consulta = {
            text: "UPDATE skaters SET estado=$2 WHERE id=$1 RETURNING *",
            values: [id, estado]
        };
        const result = await pool.query(consulta);
        return result.rows[0];
    } catch (error) {
        console.log("Error: " + error);
    }
}

const loginSkater = async (email, password) => {
  try {
    // Consulta a la base de datos para verificar las credenciales del skater
    const consulta = {
      text: 'SELECT * FROM skaters WHERE email = $1',
      values: [email]
    };

    const result = await pool.query(consulta);

    // Si se encuentra un skater con el correo proporcionado
    if (result.rows.length === 1) {
      const skater = result.rows[0];
      console.log("Skater encontrado: ", skater);
      // Verificar si la contraseña coincide
      if (skater.password === password) {
        // Si la contraseña coincide, generar y devolver el token
        const token = jwt.sign({ email }, secretKey);
        return token;
      } else {
        // Si la contraseña no coincide, lanzar un error
        throw new Error('Credenciales incorrectas');
      }
    } else {
      throw new Error('Credenciales incorrectas');
    }
  } catch (error) {
    console.error("Error en el login:", error);
    throw error; 
  }
};


module.exports = { getSkaters, registrarSkater, estadoSkater, loginSkater };