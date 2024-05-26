function manejoErrores (errorCode) {
    let status, message;

    switch (error.code) {
        case '28000':
            status = 500;
            message = "El usuario de la Base de datos no existe";
            break;
        case '3D000':
            status = 500;
            message = "La base de datos no existe ";
            break;
        case '42P01':
            status = 500;
            message = "La tabla no existe en la base de datos";
            break;
        case '23505':
            status = 400;
            message = "Ya existe un registro con el mismo valor";
            break;
        case 'ENOTFOUND':
            status = 500;
            message = "Error con el host de la conexión a la base de datos"
            break;
        case 'ECONNREFUSED':
            status = 500;
            message = "Error con el puerto de la conexión a la base de datos"
            break;
        case 'ECONNRESET':
            status = 500;
            message = "Conexión reseteada por el servidor de base de datos";
            break;
        default:
            status = 500;
            message = "Error genérico del servidor";
            break;
    }
    return {  errorCode, status, message };
};

module.exports = { manejoErrores };