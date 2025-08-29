-------------------------------------------------------------------------------------------
-- 1

create database AirportManagementSystem;

USE AirportManagementSystem;

CREATE TABLE user (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-------------------------------------------------------------------------------------------
-- 2

CREATE TABLE company (
    company_id INT Primary KEY auto_increment,
	company_name varchar(50) NOT NULL
);

CREATE TABLE Airplane (
	airplane_id INT PRIMARY KEY auto_increment,
    company_id INT,
    model_name varchar(50) NOT NULL,
    capacity INT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

CREATE TABLE Pilot (
    pilot_id INT PRIMARY KEY auto_increment,
	pilot_name varchar(50) NOT NULL
);

CREATE TABLE department (
	dept_id INT PRIMARY KEY auto_increment,
    dept_name varchar(50) NOT NULL
);

INSERT INTO department (dept_id) VALUES
('Weather check');
('Fuel check'),
('Tyre condition/Air check');

CREATE TABLE technician (
	tech_id INT PRIMARY KEY auto_increment,
    tech_name varchar(50) NOT NULL,
    dept_id INT NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES department(dept_id) ON DELETE CASCADE
);

CREATE TABLE schedule (
	s_id INT PRIMARY KEY auto_increment,
    company_id INT NOT NULL,
    airplane_id INT NOT NULL,
    pilot_id INT NOT NULL,
    takeOff datetime NOT NULL,
    canTakeOff boolean NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    FOREIGN KEY (airplane_id) REFERENCES airplane(airplane_id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES pilot(pilot_id) ON DELETE CASCADE
);

CREATE TABLE test (
	test_id INT PRIMARY KEY auto_increment,
    tech_id INT NOT NULL,
    dept_id INT NOT NULL,
    weather boolean NOT NULL,
    fuel boolean NOT NULL,
    tyre boolean NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES department(dept_id) ON DELETE CASCADE,
    FOREIGN KEY (tech_id) REFERENCES technician(tech_id) ON DELETE CASCADE
);

--------------------------------------------------------------------------------------------
-- 3

INSERT INTO company (company_name) VALUES
('Air India'),
('Indigo'),
('Emirates');

INSERT INTO airplane (company_id, model_name, capacity) VALUES
(1, 'Airbus A320neo', 180),
(1, 'Boeing 787 Dreamliner', 256),
(1, 'Airbus A321XLR', 206),
(2, 'Airbus A320neo', 180),
(2, 'ATR 72-600', 78),
(2, 'Airbus A321neo', 222),
(3, 'Boeing 737 MAX 8', 189),
(3, 'Bombardier Q400', 78),
(3, 'Boeing 737-800', 189);


INSERT INTO pilot (pilot_name) VALUES
('Jon Snow'),
('Henry Jones'),
('Ghost'),
('Eddard Stark'),
('Arya Williams'),
('Robb Richard'),
('Jamie'),
('Emilia Clarke'),
('Jorah Mormont'),
('Peter Tyrion'),
('Samwell Tarly'),
('Khal Drogo'),
('Baelish'),
('No One'),
('Davos');

INSERT INTO technician (tech_name, dept_id) VALUES
('Mike Wheeler', 1),
('Eleven Hopper', 2),
('Dustin Henderson', 3),
('Lucas Sinclair', 1),
('Max Mayfield', 2),
('Will Byers', 3),
('Steve Harrington', 1),
('Nancy Wheeler', 2),
('Jonathan Byers', 3),
('Jim Hopper', 1),
('Joyce Byers', 2),
('Robin Buckley', 3),
('Erica Sinclair', 1),
('Argyle', 2),
('Murray Bauman', 3),

('Professor', 1),
('Berlin', 2),
('Tokyo', 3),
('Rio', 1),
('Denver', 2),
('Nairobi', 3),
('Helsinki', 1),
('Oslo', 2),
('Stockholm', 3),
('Lisbon', 1),
('Bogotá', 2),
('Marseille', 3),
('Palermo', 1),
('Gandía', 2),
('Arturo Román', 3),

('Dominic Toretto', 1),
('Brian o` Conner', 2),
('Letty Ortiz', 3),
('Mia Toretto', 1),
('Roman Pearce', 2),
('Tej Parker', 3),
('Han Lue', 1),
('Gisele Yashar', 2),
('Ramsey', 3),
('Mr. Nobody', 1);