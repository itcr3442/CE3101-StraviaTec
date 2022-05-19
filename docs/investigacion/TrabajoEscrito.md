---
title:
  Instituto Tecnológico de Costa Rica\endgraf\bigskip \endgraf\bigskip\bigskip\
  Trabajo de investigación, Bases de Datos Distribuidas\endgraf\bigskip\bigskip\bigskip\bigskip
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
csl: apa.csl
nocite: |
...

\maketitle
\thispagestyle{empty}
\clearpage
\tableofcontents
\pagenumbering{roman}
\clearpage
\pagenumbering{arabic}
\setcounter{page}{1}

# Introducción

# Marco Teórico

Para desarrollar el tema de bases de datos distribuídas es esencial primero plantear que define a un sistema de este tipo. En primer lugar se deben definir algunos conceptos base. 

En primer lugar se debe definir el término de base de datos. Una base de datos se define como una colección de datos, con este término refiriéndose a hechos conocidos que pueden ser almacenados y que tienen significado implícito. Una base de datos tiene como propiedades necesarias: representa un aspecto del mundo real (minimundo) y todo cambio al mismo se refleja en ella; es una colección de datos lógicamente coherente con un significado inherente; y está diseñada, construída y populada con datos para un propósito específico con un público meta específico en mente [@elmasri-2016, pp. 4-5]. 

Se deben separar los conceptos de base de datos y sistema de administración de bases de datos. El sistema de administración de base de datos (DBMS) es un sistema computarizado que permite a los usuarios el crear y mantener una base de datos. Es un sistema de software de propósito general que facilita el proceso de definir, construír, manipular y compartir bases de datos entre varios usuarios y aplicaciones [@elmasri-2016, p.6].

Finalmente, un sistema distribuido es un ambiente computacionalen en que varios componentes están repartidos entre múltiples comutadores en una red. Estos dispositivos parten el trabajo, coordinando sus esfuerzos para completar el trabajo de forma más eficiente que la posible si tan solo un dispositivo fuera responsable de la tarea [@splunk-2022].

Respecto a sistemas distribuidos en específico se deben considerar los fundamentos relacionados al diseño de sistemas que tratan con datos distribuídos: fragmentación y replicación.

La fragmentación se refiere al como se puede partir la información para almacenarla en lugares distintos. Asumiendo que se trabaja con un modelo relacional. Se dice entonces que existen dos tipos de fragmentación: horizontal y vertical. La fragmentación horizontal se refiere a dividir los registros por tuplas, es decir, distintos equipos contienen cada uno una cierta cantidad de tuplas de una relación. En el caso de la fragmentación vertical, el término se refiere a un esquema más complejo en que se divide una relación por atributos. Cada subdivisión debe contener la llave primaria de la relación de forma que se pueda reconsuír cada tupla completa [@tupper-2011, pp. 387-388].

La replicación se refiere a la creación de datos redundantes que permiten a los procesos que necesitan acceder a la información el proceder de forma suave y efectivamente. Maximiza la disponibilidad pero hay desventajas asociadas, por ejemplo, se puede llegar a un caso en que haya redundancia en cada equipo, de manera que al momento de refrescar los datos se incurre en un gran costo computacional. Antes de aplicar la técnica de replicación se debe considerar cuidadosamente los tiempos de refrescamiento y formas de mantener la integridad referencial en la base de datos [@tupper-2011, p. 388]


# Sistemas de Bases de Datos Distribuidas

Cuando se habla de una base de datos distribuída (DDB) el término en cuestión se refiere a una coleción de múltiples, logicamente interrelacionadas bases de datos distribuidas en una red de computadores. Usualmente, la discusión respecto a las mismas también involucra a los sistemas de administración de bases de datos distribuídas (DDBMS), homólogos a los DBMS comunes pero especializados para hacer de la complejidad de los datos distribuídos algo transparente al usuario [@ozsu-2003, p.674]. Se llama sistema de base de datos distribuida(DDBS) a la combinación de una DDB y DDBMS.

Elmasri y Navathe [-@elmasri-2016, p. 873] señalan que para poder clasificar a una base de datos como un DDB se deben cumplir las siguientes condiciones:

- Conexión de nodos de bases de datos sobre una red de computadores: Se refiere a que deben haber varios equipos, llamados sitios o nodos. Estos sitios deben estar conectados por una red para transmitir datos y comandos entre sitios.

- Interrelación lógica de las bases de datos conectadas: Es necesario que la información en los distintos nodos esté relacionada de forma lógica.

- Posible ausencia de homogeneidad entre nodos conectados: No necesariamente todos los nodos son idénticos en términos de datos, hardware y software. 

La última condición es particularmente importante. No necesariamente una base de datos distribuída es de una arquitectura uniforme. Incluso la estructura de los datos puede variar de un sitio que almacena los datos en un modo relacional y otro que almacena datos en una estructura llave-valor.

El grado de homogeneidad de una base de datos es uno de los primeros factores al clasificar este tipo de sistemas. Se tienen entonces dos variaciones en base a este criterio: bases de datos con un modelo distribuido homogéneo, y bases de datos con un modelo distribuido defederado o  heterogéneo. 




- Sistemas operativos 


## Análisis de resultados

# Conclusiones

# Recomendaciones

# Bibliografía 
