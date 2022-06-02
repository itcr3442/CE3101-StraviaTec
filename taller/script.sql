BEGIN TRANSACTION;

CREATE TABLE DEPARTMENT
(
  Dname          varchar(32) NOT NULL UNIQUE,
  Dnumber        int         NOT NULL PRIMARY KEY,
  -- Necesita permitir NULL por anomalía de inserción asociada a EMPLOYEE
  Mgr_ssn        int             NULL, -- FK se agrega después
  Mgr_start_date date        NOT NULL
);
--
CREATE TABLE EMPLOYEE
(
  Fname     varchar(32)  NOT NULL,
  Minit     char(1)          NULL,
  Lname     varchar(32)  NOT NULL,
  Ssn       int          NOT NULL PRIMARY KEY,
  Bdate     date         NOT NULL,
  Address   varchar(128)     NULL,
  Sex       char(1)      NOT NULL,
  Salary    decimal      NOT NULL,
  Super_ssn int              NULL REFERENCES EMPLOYEE(Ssn),
  Dno       int          NOT NULL REFERENCES DEPARTMENT(Dnumber),

  CHECK(Sex IN ('M', 'F')),
  CHECK(Ssn > 0)
);

CREATE TABLE DEPT_LOCATIONS
(
  Dnumber   int         NOT NULL REFERENCES DEPARTMENT(DnumbeR),
  Dlocation varchar(32) NOT NULL,

  PRIMARY KEY(Dnumber, Dlocation)
);

CREATE TABLE PROJECT
(
  Pname     varchar(64) NOT NULL UNIQUE,
  Pnumber   int         NOT NULL PRIMARY KEY,
  Dlocation varchar(32) NOT NULL,
  Dnum      int         NOT NULL,

  FOREIGN KEY(Dnum, Dlocation) REFERENCES DEPT_LOCATIONS(Dnumber, Dlocation)
);

CREATE TABLE WORKS_ON
(
  Essn  int     NOT NULL REFERENCES EMPLOYEE(Ssn),
  Pno   int     NOT NULL REFERENCES PROJECT(Pnumber),
  Hours decimal     NULL,

  PRIMARY KEY(Essn, Pno)
);

CREATE TABLE DEPENDENT
(
  Essn           int         NOT NULL REFERENCES EMPLOYEE(Ssn),
  Dependent_name varchar(32) NOT NULL,
  Sex            char(1)     NOT NULL,
  Bdate          date        NOT NULL,
  Relationship   varchar(16) NOT NULL,

  PRIMARY KEY(Essn, Dependent_name),
  CHECK(Sex in ('M', 'F'))
);

-- No se inserta Mgr_ssn todavía debido a anomalía de inserción
INSERT INTO DEPARTMENT(Dname, Dnumber, Mgr_start_date) VALUES
  ('Research',       5, '1988-05-22'),
  ('Administration', 4, '1995-01-01'),
  ('Headquarters',   1, '1981-06-19');

INSERT INTO EMPLOYEE(Fname, Minit, Lname, Ssn, Bdate, Address, Sex, Salary, Dno) VALUES
  ('James', 'E', 'Borg', 888665555, '1937-11-10', '450 Stone, Houston, TX', 'M', 55000, 1);

INSERT INTO EMPLOYEE(Fname, Minit, Lname, Ssn, Bdate, Address, Sex, Salary, Super_Ssn, Dno) VALUES
  ('Franklin', 'T', 'Wong',    333445555, '1955-12-08', '638 Voss, Houston, TX',   'M', 40000, 888665555, 5),
  ('Jennifer', 'S', 'Wallace', 987654321, '1941-06-20', '291 Berry, Bellaire, TX', 'F', 43000, 888665555, 4);

INSERT INTO EMPLOYEE(Fname, Minit, Lname, Ssn, Bdate, Address, Sex, Salary, Super_Ssn, Dno) VALUES
  ('John',   'B', 'Smith',   123456789, '1965-01-09', '731 Fondren, Houston, TX', 'M', 30000, 333445555, 5),
  ('Alicia', 'J', 'Zelaya',  999887777, '1968-01-19', '3321 Castle, Spring, TX',  'F', 25000, 987654321, 4),
  ('Ramesh', 'K', 'Narayan', 666884444, '1962-09-15', '975 Fire Oak, Humble, TX', 'M', 38000, 333445555, 5),
  ('Joyce',  'A', 'English', 453453453, '1972-07-31', '5631 Rice, Houston, TX',   'F', 25000, 333445555, 5),
  ('Ahmad',  'V', 'Jabar',   987987987, '1969-03-29', '980 Dallas, Houston, TX',  'M', 25000, 987654321, 4);

-- Debido a anomalía de inserción
UPDATE DEPARTMENT SET Mgr_Ssn = 333445555 WHERE Dnumber = 5;
UPDATE DEPARTMENT SET Mgr_Ssn = 987654321 WHERE Dnumber = 4;
UPDATE DEPARTMENT SET Mgr_Ssn = 888665555 WHERE Dnumber = 1;

INSERT INTO DEPT_LOCATIONS(Dnumber, Dlocation) VALUES
  (1, 'Houston'),
  (4, 'Stafford'),
  (5, 'Bellaire'),
  (5, 'Sugarland'),
  (5, 'Houston');

INSERT INTO PROJECT(Pname, Pnumber, Dlocation, Dnum) VALUES
  ('ProductX',        1,  'Bellaire',  5),
  ('ProductY',        2,  'Sugarland', 5),
  ('ProductZ',        3,  'Houston',   5),
  ('Computerization', 10, 'Stafford',  4),
  ('Reorganization',  20, 'Houston',   1),
  ('Newbenefits',     30, 'Stafford',  4);

INSERT INTO WORKS_ON(Essn, Pno, Hours) VALUES
  (123456789, 1,  32.5),
  (123456789, 2,   7.5),
  (666884444, 3,  40.0),
  (453453453, 1,  20.0),
  (453453453, 2,  20.0),
  (333445555, 2,  10.0),
  (333445555, 3,  10.0),
  (333445555, 10, 10.0),
  (333445555, 20, 10.0),
  (999887777, 30, 30.0),
  (999887777, 10, 10.0),
  (987987987, 10, 35.0),
  (987987987, 30,  5.0),
  (987654321, 30, 20.0),
  (987654321, 20, 15.0),
  (888665555, 20, NULL);

INSERT INTO DEPENDENT(Essn, Dependent_name, Sex, Bdate, Relationship) VALUES
  (333445555, 'Alice',     'F', '1986-04-05', 'Daughter'),
  (333445555, 'Theodore',  'M', '1983-10-25', 'Son'),
  (333445555, 'Joy',       'F', '1958-05-03', 'Spouse'),
  (987654321, 'Abner',     'M', '1942-02-28', 'Spouse'),
  (123456789, 'Michael',   'M', '1988-01-04', 'Son'),
  (123456789, 'Alice',     'F', '1988-12-30', 'Daughter'),
  (123456789, 'Elizabeth', 'M', '1967-05-05', 'Spouse');

CREATE TABLE TASK
(
  ID          int         NOT NULL PRIMARY KEY,
  Name        varchar(32) NOT NULL,
  Responsible int         NOT NULL REFERENCES EMPLOYEE(Ssn),
  Duration    int         NOT NULL,

  CHECK(duration > 0)
);

CREATE TABLE PROJECT_TASK
(
  Project int NOT NULL REFERENCES PROJECT(Pnumber),
  Task    int NOT NULL REFERENCES Task(ID),

  PRIMARY KEY(Project, Task)
);

INSERT INTO TASK(ID, Name, Responsible, Duration) VALUES
  (1, 'Design',         123456789, 1),
  (2, 'Construction',   123456789, 4),
  (3, 'Test',           999887777, 1),
  (4, 'Implementation', 888665555, 1),
  (5, 'UAT',            453453453, 1);

INSERT INTO PROJECT_TASK(Project, Task) VALUES
  (10, 1),
  (10, 2),
  (10, 3),
  (10, 4),
  (10, 5);

COMMIT;
