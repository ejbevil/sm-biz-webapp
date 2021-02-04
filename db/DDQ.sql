DROP TABLE IF EXISTS purchase;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS product;
CREATE TABLE product (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  model varchar(55) NOT NULL,
  price double precision(8,2) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO product (name, model, price) VALUES 
('Synth','ZZZ111',29.99),
('Modulator', 'ABC123', 19.99),
('Upconverter', 'XYZ333', 9.99),
('Downconverter', 'XYZ222', 9.99),
('Programmable DAT', 'HGJ542', 69.99),
('LED (various colors)', 'MOY981', 0.99),
('Wheatstone Bridge', 'JWB098', 129.99),
('Hall Sensor', 'LVE736', 5.99),
('Equalizer', 'EQX743', 199.99),
('6 ft. Audio Cable', 'AUD111', 29.79);

DROP TABLE IF EXISTS customer;
CREATE TABLE customer (
  id int(11) NOT NULL AUTO_INCREMENT,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  birthdate DATE,
  street varchar(255),
  city varchar(55),
  state varchar(55),
  country varchar(55),
  zip varchar(20),
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO customer (first_name, last_name, birthdate, street, city, state, country, zip) VALUES 
('Patrick','Smith','1975-03-10','24 Boston St.', 'Rockville', 'CT', 'USA', '06066'),
('John','Williams','2000-05-01','558 Trenton St.','Goose Creek','SC','USA','29445'),
('Andrea','Johnson','1977-07-03','2891 Franklin Street','Dothan','AL','USA','36303'),
('Erica','Jones','1998-09-05','200 Wetzel Lane','Grand Rapids','MI','USA','49508'),
('Carrie','Brown','1979-11-07','2035 Cemetary St.','Salinas','Ca','USA','93901'),
('Sarah','Davis','1996-01-11','4227 Conaway St.','Columbus','IN','USA','47201'),
('Tim','Miller','1981-02-13','1764 Confederate Dr.','Syracuse','NY','USA','13202'),
('James','Wilson','1994-04-17','244 Vernon St.','San Diego','CA','USA','92103'),
('Mary','Moore','1983-06-19','1508 Trainer Avenue','Geneseo','IL','USA','61254'),
('Robert','Taylor','1992-08-23','3970 Little Acres Ln.','Clinton','IL','USA','61727'),
('Elizabeth','Anderson','1985-10-29','2755 Settlers Ln.','New York','NY','USA','10013'),
('Michael','Thomas','1990-12-31','3790 Pursglove Ct.','Wilmington','OH','USA','45177'),
('Linda','Jackson','1987-01-02','1223 Willow Oaks Lane','Lafayette','LA','USA','70506'),
('Charles','White','1988-03-04','1011 Winding Way','East Providence','RI','USA','02914'),
('Margaret','Harris','1989-05-08','1193 Traction St.','Saluda','SC','USA','29138'),
('Daniel','Martin','1986-07-16','2814 Drummond St.','Bloomfield','NJ','USA','07003'),
('Nancy','Thompson','1991-09-01','3627 Robinson Ln.','Doral','FL','USA','33166'),
('Richard','Garcia','1984-11-10','1184 Circle Dr.','Houston','TX','USA','77032'),
('Betty','Martinez','1993-01-11','4008 Meadow Lane','San Jose','CA','USA','95113'),
('Mark','Robinson','1982-02-22','3862 Sharon Lane','Goshen','IN','USA','46526');
DROP TABLE IF EXISTS store;
CREATE TABLE store (
  id int(11) NOT NULL AUTO_INCREMENT,
  street varchar(100) NOT NULL,
  city varchar(55) NOT NULL,
  state varchar(55) NOT NULL,
  country varchar(55) NOT NULL,
  zip varchar(20) NOT NULL,
  sqft int(11) NOT NULL,
  PRIMARY KEY(id)
) ENGINE=InnoDB;

INSERT INTO store (street, city, state, country, zip, sqft) VALUES 
('55 Villa Rd.','Los Angeles','CA','USA','91456',20055),
('3057 Leisure Ln.','Thousand Oaks','CA','USA','91362',209547),
('1447 Seneca Dr.','Portland','OR','USA','97205',55032),
('2109 Hillcrest Dr.','Tacoma','WA','USA','98402',79541),
('2951 Elk Rd.','Tucson','AZ','USA','85701',113582);


DROP TABLE IF EXISTS purchase;
CREATE TABLE purchase (
  id int(11) NOT NULL AUTO_INCREMENT,
  transaction varchar(55) NOT NULL,
  pid int(11) NOT NULL,
  cid int(11),
  sid int(11) NOT NULL,
  date DATE NOT NULL,
  qty int(11) NOT NULL DEFAULT 0,
  CONSTRAINT purchase_ibfk_1 FOREIGN KEY (pid) REFERENCES product(id),
  CONSTRAINT purchase_ibfk_2 FOREIGN KEY (cid) REFERENCES customer(id) ON DELETE SET NULL,
  CONSTRAINT purchase_ibfk_3 FOREIGN KEY (sid) REFERENCES store(id),
  PRIMARY KEY(id)
) ENGINE=InnoDB;

INSERT INTO purchase (transaction, pid, cid, sid, date, qty) VALUES 
('46484-AJH',1,1,1,'2018-7-7',54),
('46484-AJH',3,1,1,'2018-7-7',11),
('46484-AJH',5,1,1,'2018-7-7',7),
('95641-YDA',2,11,5,'2018-6-11',2),
('87943-KDJ',2,13,3,'2018-4-17',8),
('84334-JAD',2,7,2,'2018-2-22',13),
('46213-SDI',4,19,1,'2018-1-29',1),
('47454-ASD',6,5,5,'2018-3-31',99),
('47454-ASD',5,5,5,'2018-3-31',123),
('79862-LKJ',2,14,3,'2018-7-4',45),
('13789-NBC',1,6,4,'2018-9-6',88),
('78953-IOA',1,2,4,'2018-10-24',77),
('96832-DJS',3,1,3,'2018-6-23',30),
('96832-DJS',3,9,2,'2018-4-2',10),
('13458-KDL',6,16,5,'2018-3-9',5);

DROP TABLE IF EXISTS inventory;
CREATE TABLE inventory (
  pid int(11) NOT NULL,
  sid int(11) NOT NULL,
  qty int(11) DEFAULT 0,
  CONSTRAINT inventory_ibfk_1 FOREIGN KEY (pid) REFERENCES product(id),
  CONSTRAINT inventory_ibfk_2 FOREIGN KEY (sid) REFERENCES store(id),
  PRIMARY KEY(pid,sid)
) ENGINE=InnoDB;

INSERT INTO inventory VALUES 
(1,1,21),
(2,1,76),
(3,1,81),
(4,1,55),
(5,1,44),
(2,2,63),
(3,2,64),
(4,2,17),
(5,2,32),
(6,2,77),
(1,3,54),
(2,3,12),
(4,3,9),
(5,3,68),
(6,3,98),
(1,4,37),
(3,4,49),
(4,4,23),
(5,4,15),
(6,4,19),
(1,5,46),
(2,5,78),
(3,5,81),
(4,5,93),
(6,5,12);
