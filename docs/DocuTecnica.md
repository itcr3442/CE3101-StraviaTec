---
title:
  Instituto Tecnológico de Costa Rica\endgraf\bigskip \endgraf\bigskip\bigskip\
  Proyecto 1 - StraviaTEC \endgraf\bigskip\bigskip\bigskip\bigskip
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

![Diagrama de modelo relacional](imgs/diagramas-Relacional.png)

### Justificación de mapeo conceptual-relacional


## Estructuras de datos desarrolladas(Tablas)

## Descripción detallada de la arquitectura desarrollada

### Diagrama de arquitectura

![Diagrama de Arquitectura](imgs/diagramas-Arquitectura.png)

### Aplicación REST API

### Aplicación Web

### Aplicación Móvil

En en caso de la app móvil se puede notar lo siguiente:

- Se hace uso de SQLite para guardar datos persistentes en el dispositivo móvil.
- La interfaz entre la aplicación y SQLite se da por medio de la biblioteca Room.
- El dispositivo móvil se conecta a la red, pero antes de conectarse a la red existe un nodo que indica la existencia de un proceso de sincronización durante las interacciones con los recursos de la red.

La arquitectura anterior es producto de los requerimientos de la aplicación móvil, en específico, que a diferencia de la aplicación web, la aplicación móvil debe proveer la funcionalidad de la vista de reservaciones incluso sin conexión a los recursos de red. Es por esto que la misma dispone de sus propias bases de datos locales. El tamaño de los símbolos de base de datos también denota algo adicional - respecto a la base de datos principal, la base de datos local de la aplicación móvil contiene significativamente menor información, puesto que mucha de la información guardada en el servidor principal es irrelevante para la operación de la aplicación móvil.

## Problemas conocidos

## Problemas encontrados

## Conclusiones

## Recomendaciones

## Bibliografía

::: {#refs}
:::

