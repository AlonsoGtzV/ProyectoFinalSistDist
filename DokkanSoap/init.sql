-- Seleccionar la base de datos 'users'
USE users;

-- Crear la tabla 'Userr'
CREATE TABLE Userr (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    powerlevel INT NOT NULL,
    cardId VARCHAR(50)
);

-- Insertar registros iniciales
INSERT INTO Userr (username, level, powerlevel, cardId) VALUES
('Pipote', 2, 20, NULL),
('Zorex', 234, 200, NULL),
('UrG0D', 731, 1109501, NULL),
('Pacoco', 1, 1, NULL);
