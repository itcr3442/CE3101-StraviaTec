---
title:
  Instituto Tecnológico de Costa Rica\endgraf\bigskip \endgraf\bigskip\bigskip\
  StraviaTEC Manual de Usuario \endgraf\bigskip\bigskip\bigskip\bigskip
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
...

\maketitle
\thispagestyle{empty}
\clearpage
\tableofcontents
\pagenumbering{roman}
\clearpage
\pagenumbering{arabic}
\setcounter{page}{1}

# Servicio Web 



# App Web

## Vista Deportista

### Crear cuenta

### Log In

### Página de Inicio

### Búsqueda y seguimiento de atletas

### Registrar Actividad

### Comentar Actividades

### Inscribirse en una Carrera

### Inscribirse en un Reto

### Asociarse a un Grupo

### Ver retos y carrearas inscritos

## Vista Organizador

### Gestión de Carrear

### Aceptar Inscripción

### Gestión de Retos

### Gestión de Grupos

### Reporte de Participantes por Carrera

### Reporte de Posiciones de Carrera


# App Móvil

## Notas previas 

Asegúrese de tener los servicios de localización activados y verifique que la aplicación tenga los permisos adecuados especificados en el manual de instalación. 

## Autenticación

Al abrir la aplicación se presenta una pantalla en la que se ingresan los datos de autenticación, se selecciona el modo de operación (Online u Offline) y se puede realizar algunas configuraciones adicionales:

![Pantalla de inicio de sesión \label{movil_login}](imgs/movil_login.jpg){height=40%}

- Uso con conexión: Cada solicitud se coordinará con el la aplicación que administra el servidor. En cada operación la base de datos actualizará el "caché" de datos local que se utilizará en modo offline.

- Uso sin conexión: Cada solicitud en este modo quedará pendiente de sincronización, y será aplicada hasta un nuevo login en modo en línea o una sincronización sin login.

- Configuración de servidor: En caso de querer editar la dirección web en la que se espera se encuentre el servidor que provee los datos para la aplicación, puede darle click al botón de configuración de servidor y esto habilitará la caja de texto para ingresar la nueva dirección.

- Sincronización sin conexión: Algunas operaciones puede ser conflictivas si se realizan mientras se tiene una sesión activa, por lo cuál se habilita la posibilidad de sincronizar los datos sin necesidad de loggearse en la aplicación.

Una vez autenticado el usuario, se mostrará el menú principal:

## Creación de actividades

Primeramente a tomar en cuenta, dado que no es requisito de la aplicación el poder crear una variedad distinta de tipos de actividades, se crean por defecto solo actividades de ciclismo que no están ligadas a un reto o carrera. 

### Muestra de datos de la actividad

En la pantalla de creación de actividades, tal como se muestra en la figura \ref{actividad0}, se observan los siguientes indicadores: 

- Tiempo desde que inició la actividad
- Kilómetros recorridos
- Velocidad promedio de la actividad
- Posición actual (punto azul)

![Pantalla de actividad sin iniciar \label{actividad0}](imgs/movil_actividad_0.jpg){height=40%}

### Almacenamiento de la ruta gps

La aplicación hace uso del API de Google Play Services para obtener puntos de la ruta recorrida. Para trazar la ruta de la actividad, tal como se muestra en la figura \ref{actividad0}, se hace uso de los servicios de google maps. 

![Pantalla de actividad en progreso\label{actividad0}](imgs/movil_actividad_1.jpg){height=40%}

Internamente, la aplicación va guardando una lista de puntos dados por los servicios de localización y una vez que el usuario decide terminar la actividad, esta lista es utilizada para generar un texto con formato `gpx` de la ruta. 

```XML

<?xml version="1.0" encoding="utf-8"?>
<gpx 
  xmlns="http://www.topografix.com/GPX/1/1" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  creator="StraviaTEC 0.1.0" version="1.1" 
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 
  http://www.topografix.com/GPX/1/1/gpx.xsd">
  <trk>
    <name>route</name>
    <trkseg>
      <trkpt lat="9.9400729" lon="-84.095868">
        <time>2022-05-30T03:28:17Z</time>
      </trkpt>
      <trkpt lat="9.9400484" lon="-84.0958334">
        <time>2022-05-30T03:29:21Z</time>
      </trkpt>
      <trkpt lat="9.9400534" lon="-84.0958432">
        <time>2022-05-30T03:29:22Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
```

En una sesión sin conexión, el texto de la ruta se guardará en la base de datos local junto con la información necesaria de la actividad para registrarla posteriormente en el proceso de sincronización. 

En una sesión con conexión, inmediatamente se realizará la consulta al servicio web de StraviaTEC para registrar la actividad con su ruta correspondiente

### Proceso de sincronización

Varios usuarios se pudieron haber conectado a la aplicación sin una conexión, y puede que cada uno haya registrado diversas actividades durante este tiempo. Es por esto que internamente la aplicación dispone de un base de datos que guarda las actividades con la información de usuario empotrada, tal como se muestra en la figura \ref{movil_datos0}.

![Datos de actividades sin sincronizar en base de datos local de la aplicación \label{movil_datos0}}](imgs/movil_db.png)

La sincronización puede ocurrir de dos maneras:

- Sincronización automática: Cuando el usuario inicia sesión en una sesión en línea, automáticamente la aplicación tratará de ejecutar la rutina de sincronización

- Sincronización sin inicio de sesión: Tal como se muestra en la figura \ref{movil_login}, se dispone de un botón con la etiqueta de "Sync" que permite realizar una operación de sincronización sin necesidad de iniciar sesión. 