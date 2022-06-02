---
title:
  Instituto Tecnológico de Costa Rica\endgraf\bigskip \endgraf\bigskip\bigskip\
  Proyecto 2 - StraviaTEC \endgraf\bigskip\bigskip\bigskip\bigskip
author:
  - José Morales Vargas, carné 2019024270
  - Alejandro Soto Chacón, carné 2019008164
  - Ignacio Vargas Campos, carné 2019053776
  - José Retana Corrales, carné 2020144743
date: \bigskip\bigskip\bigskip\bigskip Área Académica de\endgraf Ingeniería en Computadores \endgraf\bigskip\bigskip\ Bases de Datos \endgraf  (CE3101) \endgraf\bigskip\bigskip Profesor Marco Rivera Meneses \endgraf\vfill  Semestre I 2022
header-includes:
  - \setlength\parindent{24pt}
  - \usepackage{url}
  - \usepackage{float}
  - \floatplacement{figure}{H}
lang: es-ES
papersize: letter
classoption: fleqn
geometry: margin=1in
fontsize: 12pt
fontfamily: sans
linestretch: 1.5
bibliography: bibliografia.bib
csl: ieee.csl
nocite: | 
  @microsoft-2022A, @microsoft-2022B, @microsoft-2020, @google-2021, @google-2022, @elmasri-2016, @unknown-author-2021, @android-room
...

\maketitle
\thispagestyle{empty}
\clearpage
\tableofcontents
\pagenumbering{roman}
\clearpage
\pagenumbering{arabic}
\setcounter{page}{1}

## Modelo conceptual

![Diagrama de modelo conceptual](imgs/diagramas-Conceptual.png)

## Modelo relacional

![Diagrama de modelo relacional](imgs/diagramas-Relacional.png){height=80%}

## Mapeo conceptual-relacional

### Mapeo de tipos de entidades fuertes

Se crean relaciones para las siguientes entidades fuertes:

| Nombre entidad | Pk          |
|:---------------|:-----------:|    
| `country`      | iso         |            
| `user`         | id          |    
| `group`        | id          |        
| `activity_type`| id          |                
| `activity`     | id          |                    
| `race`         | id          |        
| `challenge`    | id          |                
| `category`     | id          |  
| `sponsor`      | id          |  

Por buena práctica se separan los datos "pesados" en sus relaciones propias con 
llaves foráneas que referencian a las entidades a las que pertenecen, 
específicamente:

1. `photo`: Contiene el atributo `photo` de cada `user`.
1. `sponsor_logo`: Contiene el atributo `logo` de cada `sponsor`.
1. `activity_track`: Contiene el atributo `track` de cada `activity`.
1. `race_track`: Contiene el atributo `track` de cada `race`.

### Mapeo de tipos de entidades débiles

Solo se tiene una entidad débil: `bank_account`, relacionada a race por medio de 
la relación `race_account`. Esta se mapea a una relación de dos atributos:

- `race`: Referencia a entidad propietaria.
- `iban`: Llave parcial de la entidad débil.

### Mapeo de tipos de asociaciones binarias 1:1

No se encuentran este tipo de relaciones en el modelo de relacional.

### Mapeo de tipos de asociaciones binarias 1:N

Para las relaciones 1:N se decidió realizar el mapeo con un enfoque en evitar 
posibilidad de valores nulos. 

Se mapean como atributos de otras relaciones las siguientes relaciones que 
tienen participación absoluta del lado N:

1. `lives in` se mapea a un atributo FK `country` de la relación `user` que 
   referencia un `id` de `country`.
1. `type` se mapea a un atributo FK de `activity` llamado de igual manera. 
   Referencia un `id` de `type`.
1. `rtype` se mapea a un atributo FK de `race` llamado `type`. Referencia un 
   `id` de `type`.
1. `chtype` se mapea a un atributo FK de `challenge` llamado `type`. Referencia 
   un `id` de `type`.
1. `admin` se mapea a un atributo FK de `group` llamado `admin` que referencia 
   un `id` de un `user`.
1. `activity_athlete` se mapea a un atributo FK de `activity` llamado `athlete` 
   que referencia un `id` de user.

Se mapean como referencias cruzadas las relaciones que sí pueden presentar en 
algún momento valores nulos:

1. `race_group`: FKs a `race` y `group`.
1. `race_category`: FKs a `race` y `category`.
1. `race_sponsor`: FKs a `race` y `sponsor`.
1. `challenge_group`: FKs a `challenge` y `group`.
1. `challenge_participant`: FKs a `challenge` y `athlete`.
1. `challenge_activity`: FKs a `challenge` y `activity`.

### Mapeo de tipos de asociaciones binarias N:M

Estas relaciones de mapean a relaciones de referencias cruzadas.

1. `friendship`: Se mapea a una relación `friend` que contiene un atributo 
   `follower` y otro `followee` que referencian al atributo `id` de `user`. 
1. `receipt`: Se mapea a una relación `receipt` que contiene el atributo de la 
   relación `receipt_file` bajo el nombre de `receipt` y FKs que apuntan a las 
   PKs de `race` y `user`.
1. `comments`: Se mapea a una relación `comment` con FKs que referencias a las 
   PKs de `activity` y `user`.

### Mapeo de atributos multivaluados

No se tienen atributos multivaluados para mapear. 

### Relación ternaria (caso especial)

La relación `race_participant` relaciona  `race`,  `user` y `activity`, sin 
embargo, la relación con la última entidad tiene una funcionalidad de registro 
de completitud, pero no es tan relevante para lo que esta relación expresa. Se 
mapea esta relación a una relación cruzada de las 3 entidades, donde la PK de la
relación es una combinación entre la referencia a `race` y a `user`.

## Estructuras de datos desarrolladas(Tablas)

Como nota general, a la hora de crear las tablas correspondientes a cada
relación, se tomó la decisión de nombrar las tablas con el nombre de la relación
en plural, de manera que se da a entender mejor que la tabla almacena un
conjunto de datos. 

### Tabla de relación `country`

Contiene información relacionada a un país específico.

```SQL
CREATE TABLE countries
(
  -- ISO 3166-1 alfa-2
  iso        char(2)     NOT NULL PRIMARY KEY,
  name       varchar(80) NOT NULL,
  iso3       char(3)         NULL,
  num_code   int             NULL,
  phone_code int         NOT NULL,
) 
```
### Tabla de relación `user`

Contiene información específica de un usuario. Si bien la identificación es
tomada como la llave primaria, este hecho es transparente afuera de la base de
datos, en donde se utiliza el nombre de usuario como una pseudo llave primaria
(nótese que tiene el constraint `UNIQUE` pero no es llave primaria real).

```SQL
CREATE TABLE users
(
  id           int         NOT NULL IDENTITY PRIMARY KEY,
  username     varchar(64) NOT NULL UNIQUE,
  first_name   varchar(64) NOT NULL,
  last_name    varchar(64) NOT NULL,
  birth_date   DATE        NOT NULL,
  country      char(2)     NOT NULL REFERENCES countries(iso),
  is_organizer bit         NOT NULL,
  hash         binary(16)  NOT NULL,
  salt         binary(16)  NOT NULL,

  CHECK(LEN(username) > 0 AND username NOT LIKE '%[^a-z]%'),
  CHECK(LEN(first_name) > 0 AND LEN(last_name) > 0),
);
```

Además, se tiene checks que evitan nombres de usuario incoherentes y campos de 
nombres y apellidos vacíos.

### Tabla de relación `photo`

Como se mencionó anteriormente, cuando se tiene un dato de tamaño sustancial, la
buena práctica es separarlo en su tabla separada. En este caso, la tabla 
`photos` permite almacenar la foto de perfil de los usuarios de la aplicación.

```SQL
CREATE TABLE photos
(
  user_id int            NOT NULL REFERENCES users(id),
  photo   varbinary(max) NOT NULL, -- El parámetro es max o < 8000
);
```

### Tabla de relacion `friends`

Esta tabla almacena la información sobre amistades entre usuarios. Se verifica
que en dicha relación ambos usuarios referenciados sean distintos.

```SQL
CREATE TABLE friends
(
  follower int NOT NULL REFERENCES users(id),
  followee int NOT NULL REFERENCES users(id),

  PRIMARY KEY(follower, followee),
  CHECK(follower <> followee),
);
```

### Tabla de relación `activity_type`

Contiene la información respecto al tipo de actividades que se pueden realizar.

```SQL
CREATE TABLE activity_types
(
  id   int         NOT NULL IDENTITY PRIMARY KEY,
  name varchar(32) NOT NULL UNIQUE,
);
```

### Tabla de relación `activity`

Contiene información referente a actividades. Tiene llaves foráneas a usuario
para referenciar al atleta que crea la actividad, y otra llave foránea que 
indica el tipo de actividad.

```SQL
CREATE TABLE activities
(
  id         int      NOT NULL IDENTITY PRIMARY KEY,
  athlete    int      NOT NULL REFERENCES users(id),
  start_time datetime NOT NULL,
  end_time   datetime NOT NULL,
  type       int      NOT NULL REFERENCES activity_types(id),
  length     decimal  NOT NULL,

  CHECK(start_time < end_time),
);
```

### Tabla de relación `activity track`

Al igual que la tabla `photos`, esta tabla permite separar un dato pesado tal
como es el gpx que almacena la ruta de una actividad, de la actividad en sí.

```SQL
CREATE TABLE activity_tracks
(
  activity int      NOT NULL PRIMARY KEY REFERENCES activities(id),
  track    xml(gpx) NOT NULL,
);
```

### Tabla de relación `group`

Contiene la información referente a un grupo. Su nombre no puede ser vacío y
debe tener un administrador único.

```SQL
CREATE TABLE groups
(
  id    int         NOT NULL IDENTITY PRIMARY KEY,
  name  varchar(64) NOT NULL UNIQUE,
  admin int         NOT NULL REFERENCES users(id),

  CHECK(LEN(name) > 0),
);
```

### Tabla de relación `group_member`

Contiene la información que permite identificar que usuarios se encuentran
asociados a un grupo en específico. 

```SQL
CREATE TABLE group_members
(
  group_id int NOT NULL REFERENCES groups(id),
  member   int NOT NULL REFERENCES users(id),
);
```

### Tabla de relación `category`

Contiene información sobre una categoría de competición. 

```SQL
CREATE TABLE categories
(
  id   int         NOT NULL IDENTITY PRIMARY KEY,
  name varchar(32) NOT NULL UNIQUE,
);
```

### Tabla de relación `sponsor`

Contiene la información correspondiente a los patrocinadores de una competencia. 

```SQL
CREATE TABLE sponsors
(
  id         int         NOT NULL IDENTITY PRIMARY KEY,
  brand_name varchar(64) NOT NULL UNIQUE,
  legal_rep  varchar(64) NOT NULL,
  legal_tel  varchar(32) NOT NULL,

  CHECK(brand_name > 0),
);
```

### Tabla de relación `sponsor_logo`

Al igual que `photos`, es una tabla utilitaria para separar un dato pesado como
la imagen del logo del patrocinador de el resto de información del patrocinador.

```SQL
CREATE TABLE sponsor_logos
(
  sponsor int            NOT NULL REFERENCES sponsors(id),
  logo    varbinary(max) NOT NULL,
);
```

### Tabla de relación `race`

Contiene la información referente a una carrera. El nombre de la carrera no 
puede ser vacío, y la carrera debe tener un precio de valor positivo.

```SQL
CREATE TABLE races
(
  id      int         NOT NULL IDENTITY PRIMARY KEY,
  name    varchar(64) NOT NULL UNIQUE,
  on_date date        NOT NULL,
  type    int         NOT NULL REFERENCES activity_types(id),
  price   decimal     NOT NULL,

  CHECK(LEN(name) > 0),
  CHECK(price > 0),
);
```

### Tabla de relación `race_category`

Contiene la información de la referencia cruzada entre las tablas `races` y 
`categories`.

```SQL
CREATE TABLE race_categories
(
  race     int NOT NULL REFERENCES races(id),
  category int NOT NULL REFERENCES categories(id),

  PRIMARY KEY(race, category),
);
```

### Tabla de relación `race_track`

Esta es otra tabla para separar un gpx del resto de información, en este caso, 
para las carreras.

```SQL
CREATE TABLE race_tracks
(
  race  int      NOT NULL PRIMARY KEY REFERENCES races(id),
  track xml(gpx) NOT NULL,
);
```

### Tabla de relación `race_private_group`

Contiene la información sobre los grupos para los cuales una carrera es visible.

```SQL
CREATE TABLE race_private_groups
(
  race     int NOT NULL REFERENCES races(id),
  group_id int NOT NULL REFERENCES groups(id),

  PRIMARY KEY(race, group_id),
);
```

### Tabla de relación `race_participant`

Contiene la información sobre los participantes que se encuentran inscritos en
una carrera, y una vez completada la carrera, almacena una referencia a la
actividad que corresponde a dicha carrera.

```SQL
CREATE TABLE race_participants
(
  race     int NOT NULL REFERENCES races(id),
  athlete  int NOT NULL REFERENCES users(id),
  activity int     NULL REFERENCES activities(id),

  PRIMARY KEY(race, athlete),
);
```

### Tabla de relación `race_sponsor`

Referencia cruzada que contiene la información sobre quienes patrocinan una 
carrera.

```SQL
CREATE TABLE race_sponsors
(
  race    int NOT NULL REFERENCES races(id),
  sponsor int NOT NULL REFERENCES sponsors(id),

  PRIMARY KEY(race, sponsor),
);
```

### Tabla de relación `receipt` 

Contiene el recibo de pago de un usuario para entrar a una carrera, y
las referencias al usuario y carrera en cuestión. 

```SQL
CREATE TABLE receipts
(
  race    int            NOT NULL REFERENCES races(id),
  athlete int            NOT NULL REFERENCES users(id),
  receipt varbinary(max) NOT NULL,

  PRIMARY KEY(race, athlete),
);
```

### Tabla de relación `bank_account`

Provee la información sobre que cuentas bancarias son válidas para pagar una 
carrera en particular. 

```SQL
CREATE TABLE bank_accounts
(
  race int         NOT NULL REFERENCES races(id),
  iban varchar(34) NOT NULL, -- ISO 13616

  PRIMARY KEY(race, iban),
);
```

### Tabla de relación `challenge`

Contiene la información correspondiente a un reto. Los retos difieren de las 
carreras principalmente por el hecho de que son actividades "asincrónicas", es
decir, no se completan simultáneamente, sino que cada atleta puede ir
completando un reto de manera incremental. 

```SQL
CREATE TABLE challenges
(
  id         int         NOT NULL IDENTITY PRIMARY KEY,
  name       varchar(64) NOT NULL UNIQUE,
  start_time datetime    NOT NULL,
  end_time   datetime    NOT NULL,
  type       int         NOT NULL REFERENCES activity_types(id),
  goal       decimal     NOT NULL,

  CHECK(LEN(name) > 0),
  CHECK(start_time < end_time),
  CHECK(goal > 0),
);
```

### Tabla de relación `challenge_private_group`

Contiene los datos que indican para qué grupos es visible un reto en particular.

```SQL
CREATE TABLE challenge_private_groups
(
  challenge int NOT NULL REFERENCES challenges(id),
  group_id  int NOT NULL REFERENCES groups(id),

  PRIMARY KEY(challenge, group_id),
);
```

### Tabla de relación `challenge_participant`

Referencia cruzada que indica qué atletas se encuentran participando en un reto.

```SQL
CREATE TABLE challenge_participants
(
  challenge int NOT NULL REFERENCES challenges(id),
  athlete   int NOT NULL REFERENCES users(id),

  PRIMARY KEY(challenge, athlete),
);
```
### Tabla de relación `challenge_activity`

Permite relacionar actividades de los distintos usuarios a un reto. Se 
diferencia de su homólogo para carreras puesto que un reto se puede completar
con varias actividades.

```SQL
CREATE TABLE challenge_activities
(
  challenge int NOT NULL REFERENCES challenges(id),
  activity  int NOT NULL REFERENCES activities(id),
  seq_no    int NOT NULL,

  PRIMARY KEY(challenge, activity),
  CHECK(seq_no >= 0),
);
```

### SQLite `User`

Para almacenar credenciales utilizadas (de forma que se pueda tener un login
offline), se hace uso de una tabla `User` que contiene nombre de usuario y 
contraseña de usuario. 

```Kotlin
@Entity
data class User(
    @PrimaryKey val username: String,
    val password: String,
)
```

### SQLite `Activity`

Para almacenar actividades que se realizan en modo sin conexión se hace uso de
una tabla adicional. 

```
@Entity
data class Activity(
    @PrimaryKey val start: String,
    val end: String,
    val length: Float,
    val type: String,
    var gpx: String,
    @Embedded
    val user: User,
)
```

## Descripción detallada de la arquitectura desarrollada

### Diagrama de arquitectura

![Diagrama de Arquitectura \label{diag-arqui}](imgs/diagramas-Arquitectura.png)

El software desarrollado se puede separar en dos dominios: app móvil y software 
desplegado en la nube. Lo que se muestra como vistas en el diagrama de la figura
\ref{diag-arqui} son realmente consumidores de la app web que forma parte del 
dominio de software desplegado en la nube.

En en caso de la app móvil se puede notar lo siguiente:

- Se hace uso de SQLite para guardar datos persistentes en el dispositivo móvil.
- La interfaz entre la aplicación y SQLite se da por medio de la biblioteca Room.
- El dispositivo móvil se conecta a la red, pero antes de conectarse a la red 
  existe un nodo que indica la existencia de un proceso de sincronización 
  durante las interacciones con los recursos de la red.

En el dominio de software desplegado en la nube la arquitectura es un poco más 
compleja. Se puede notar que:

- Todo el software es parte del mismo conjunto de recursos desplegados en Azure.
- Se tiene la base de datos principal corriendo en su propio SQL Server.
- La base de datos NoSQL (MongoDB) se encuentra desplegada en una máquina virtual 
  propia (azure no tiene un servicio dedicado de MongoDB).
- Tanto la App Web como la REST API son desplegadas en el mismo Web Server. Se 
  mantienen como aplicaciones separadas, pero ambas son accesibles desde la
  misma url. 
- La REST API se conecta a las bases de datos desplegadas en Azure internamente,
  es decir, su interacción no es visible en la red externa a lo desplegado en
  azure. 

## Problemas conocidos

## Problemas encontrados

## Conclusiones

## Recomendaciones

## Bibliografía

::: {#refs}
:::

