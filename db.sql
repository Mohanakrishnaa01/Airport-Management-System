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
        
    airplane_id INT NOT NULL,
    pilot_id INT NOT NULL,
    takeOff datetime NOT NULL,
    canTakeOff boolean NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    FOREIGN KEY (airplane_id) REFERENCES airplane(airplane_id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES pilot(pilot_id) ON DELETE CASCADE,
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




--------------------------------------------------------------------------------------------
-- 4


alter table test add column (s_id INT);

ALTER TABLE test
ADD CONSTRAINT fk_test_s_id
FOREIGN KEY (s_id) REFERENCES schedule(s_id)
ON DELETE CASCADE;


--------------------------------------------------------------------------------------------
-- 5

ALTER TABLE test
MODIFY COLUMN s_id INT NOT NULL;

ALTER TABLE test
MODIFY COLUMN dept_id INT NULL;
ALTER TABLE test
MODIFY COLUMN tech_id INT NULL;
ALTER TABLE test
MODIFY COLUMN weather INT NULL;
ALTER TABLE test
MODIFY COLUMN fuel INT NULL;
ALTER TABLE test
MODIFY COLUMN tyre INT NULL;



DELIMITER $$

CREATE or REPLACE TRIGGER addTest
AFTER INSERT ON schedule
for each ROW
BEGIN
	INSERT INTO test (s_id, dept_id) VALUES (NEW.s_id, 1);
    INSERT INTO test (s_id, dept_id) VALUES (NEW.s_id, 2);
    INSERT INTO test (s_id, dept_id) VALUES (NEW.s_id, 3);
END$$

DELIMITER ;



ALTER TABLE schedule
MODIFY COLUMN pilot_id INT NULL;
ALTER TABLE schedule
MODIFY COLUMN canTakeOff INT NULL;


----------------------------------------------------------------------------------------------------------------------------

ALTER TABLE table_name DROP PRIMARY KEY;


ALTER TABLE user ADD COLUMN worker_id INT AUTO_INCREMENT PRIMARY KEY;
ALTER TABLE technician ADD COLUMN worker_id INT;
ALTER TABLE pilot ADD COLUMN worker_id INT;

ALTER TABLE technician ADD COLUMN email varchar(100);
ALTER TABLE pilot ADD COLUMN email varchar(100);


UPDATE technician
SET email = CONCAT(
    LOWER(REPLACE(name, ' ', '.')),   -- use name as base
    FLOOR(RAND() * 100),            -- random number (0–9999)
    '@gmail.com'                    -- fixed domain
);


ALTER TABLE userdetails ADD COLUMN name varchar(50);

INSERT INTO user (name, email)
SELECT name, email FROM pilot;

INSERT INTO user (name, email)
SELECT name, email FROM technician;


update userDetails
set password = substring_index(email, '@', 1);

update userDetails
set role = "WORKER"
where role != "ADMIN";

UPDATE technician t
JOIN userdetails u ON t.email = u.email
SET t.worker_id = u.worker_id;

UPDATE pilot p
JOIN userdetails u ON p.email = u.email
SET p.worker_id = u.worker_id;

ALTER TABLE technician
ADD CONSTRAINT fk_technician_user FOREIGN KEY (worker_id) REFERENCES userdetails(worker_id);

ALTER TABLE pilot
ADD CONSTRAINT fk_pilot_user FOREIGN KEY (worker_id) REFERENCES userdetails(worker_id);

UPDATE userdetails u
LEFT JOIN technician t ON u.email = t.email
LEFT JOIN pilot p ON u.email = p.email
SET u.role = CASE
    WHEN t.email IS NOT NULL THEN 'technician'
    WHEN p.email IS NOT NULL THEN 'pilot'
    ELSE u.role
END;
