import mysql.connector # type: ignore


DB_CONFIG = {
    "host": "mysqldb",  
    "user": "root",     
    "password": "admin",  
    "database": "users", 
}

def get_db_connection():
    """ Realiza la conexión a la base de datos."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as err:
        print(f"Error al intentar conectar a la BD: {err}")
        raise

def fetch_user_by_id(user_id):
    """Obtiene un usuario por ID de la BD."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Userr WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        return user
    finally:
        cursor.close()
        connection.close()

def insert_userr(username, level, powerlevel, card_id=None):
    """Inserta un nuevo usuario en la tabla User."""
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO Userr (username, level, powerlevel, cardId) VALUES (%s, %s, %s, %s)",
            (username, level, powerlevel, card_id),
        )
        connection.commit()
        return cursor.lastrowid  # Retorna el ID del nuevo registro
    finally:
        cursor.close()
        connection.close()