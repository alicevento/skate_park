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
      console.log("Error en consultar skaters: " + error.code);
        throw error;
        
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
        console.log("Error al registrar Skater: " + error);
    }
}
//Función para actualizar estado por el lado del administrador
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

//Función para actualizar skater
const updateSkater = async (email, nombre, password, anos_experiencia, especialidad) => {
  const consulta = {
      text:'UPDATE skaters SET nombre = $2, password = $3, anos_experiencia = $4, especialidad = $5 WHERE email = $1',
      values:[email, nombre, password, anos_experiencia, especialidad]
  }
  try {
      const result = await pool.query(consulta);
      return result.rowCount;
  } catch (error) {
      console.log("Error en consultas updateSkater: " + error);
  }
};


//Funcion para eliminar skater
const deleteSkater = async (id) => {
  try {
    console.log("ID del skater a eliminar:", id); // Agregar este registro para verificar el ID del skater
    const consulta = {
      text: "DELETE FROM skaters WHERE id = $1",
      values: [id]
    };
    const result = await pool.query(consulta);
    return result.rows[0];
  } catch (error) {
    console.log("Error en consultas de borrar Skater: " + error);
  }
};

//Función para buscar skater por mail y password
const loginSkater = async (email, password) => {
  const consulta = {
      text:'SELECT id, email, nombre, password, anos_experiencia, especialidad, foto, estado FROM skaters WHERE email=$1 AND password=$2',
      values:[email, password]
  }
  try {
      const result = await pool.query(consulta);
      return result.rows[0];
  } catch (error) {
      console.log("Error en consultas consultarSkater: " + error);
  }
};


module.exports = { getSkaters, registrarSkater, estadoSkater, loginSkater, updateSkater, deleteSkater, loginSkater };