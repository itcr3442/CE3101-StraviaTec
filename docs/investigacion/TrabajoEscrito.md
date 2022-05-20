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
  - \usepackage{caption}
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

A partir de los años 80’s y 90’s, se empezó a experimentar problemas de distribución de datos, replicación de datos, procesamiento de distribuciones de queries y transacciones y de manejo de la distribución de la metadata en las bases de datos. Estos problemas llevaron al desarrollo de un nuevo tipo de bases de datos y de manejo de estos, de donde originaron las bases de datos distribuidas (DDBs) y los sistemas de manejo de bases de datos distribuidas (DDBMSs). En general, estos tienen como principal objetivo la partición de problemas grandes y muy difíciles de manejar en pequeñas partes para que sea resuelta de manera coordinada y eficiente. 

Con este trabajo de investigación se pretende explicar y describir el funcionamiento de este tipo de bases de datos, para así lograr implementar y desarrollar este tipo de bases de datos en práctica. Aparte de esto, se pretende describir qué exactamente constituye una base de datos distribuida, y las condiciones mínimas que hacen que estas sean clasificadas de esta manera. Para esto, se desea explicar primeramente las definiciones básicas de bases de datos y de los sistemas de manejo de bases de datos regulares, así como las definiciones de fragmentación, replicación, concurrencia, atomicidad, consistencia, aislamiento y persistencia.

Una vez definidos estos conceptos, se describirán los tipos de bases de datos distribuidas, así como ver el origen y las dificultades que provienen de realizar una base de datos distribuida heterogénea, especialmente en términos de la concurrencia y de la serializabilidad global, para los cuales se quiere determinar los principales métodos para solucionar y enforzar estas cualidades necesarias para las bases de datos distribuidas.

Por último, se pretende describir las principales ventajas que ofrecen las bases de datos distribuidas, especialmente en términos de la flexibilidad la fiabilidad, el fácil aumento de la velocidad y escalabilidad del sistema,  la geo-distribución de los nodos, la autonomía que brinda el sistema para cada nodo, el manejo de tráfico y disponibilidad.

\pagebreak

# Marco Teórico

Para desarrollar el tema de bases de datos distribuidas es esencial primero plantear que define a un sistema de este tipo. En primer lugar se deben definir algunos conceptos base. 

En primer lugar se debe definir el término de base de datos. Una base de datos se define como una colección de datos, con este término refiriéndose a hechos conocidos que pueden ser almacenados y que tienen significado implícito. Una base de datos tiene como propiedades necesarias: representa un aspecto del mundo real (minimundo) y todo cambio al mismo se refleja en ella; es una colección de datos lógicamente coherente con un significado inherente; y está diseñada, construida y populada con datos para un propósito específico con un público meta específico en mente [@elmasri-2016, pp. 4-5]. 

Se deben separar los conceptos de base de datos y sistema de administración de bases de datos. El sistema de administración de base de datos (DBMS) es un sistema computarizado que permite a los usuarios el crear y mantener una base de datos. Es un sistema de software de propósito general que facilita el proceso de definir, construir, manipular y compartir bases de datos entre varios usuarios y aplicaciones [@elmasri-2016, p.6].

Finalmente, un sistema distribuido es un ambiente computacional en el que varios componentes están repartidos entre múltiples conmutadores en una red. Estos dispositivos parten el trabajo, coordinando sus esfuerzos para completar el trabajo de forma más eficiente que la posible si tan solo un dispositivo fuera responsable de la tarea [@splunk-2022].

Respecto a sistemas distribuidos en específico se deben considerar los fundamentos relacionados al diseño de sistemas que tratan con datos distribuidos: fragmentación y replicación.

![Ejemplo de fragmentación y replicación [@elmasri-2016, p. 844].](./replifrag.png)

La fragmentación se refiere al cómo se puede partir la información para almacenarla en lugares distintos. Asumiendo que se trabaja con un modelo relacional. Se dice entonces que existen dos tipos de fragmentación: horizontal y vertical. La fragmentación horizontal se refiere a dividir los registros por tuplas, es decir, distintos equipos contienen cada uno una cierta cantidad de tuplas de una relación. En el caso de la fragmentación vertical, el término se refiere a un esquema más complejo en que se divide una relación por atributos. Cada subdivisión debe contener la llave primaria de la relación de forma que se pueda reconstruir cada tupla completa [@tupper-2011, pp. 387-388].

La replicación se refiere a la creación de datos redundantes que permiten a los procesos que necesitan acceder a la información el proceder de forma suave y efectivamente. Maximiza la disponibilidad pero hay desventajas asociadas, por ejemplo, se puede llegar a un caso en que haya redundancia en cada equipo, de manera que al momento de refrescar los datos se incurre en un gran costo computacional. Antes de aplicar la técnica de replicación se debe considerar cuidadosamente los tiempos de refrescamiento y formas de mantener la integridad referencial en la base de datos [@tupper-2011, p. 388]

Otro fundamento teórico importante que tomar en cuenta para el estudio de las bases de datos distribuidas es el control de concurrencia, problema que se vuelve más complejo cuando los datos están descentralizados. Harrington [-@harrington-2016, pp. 450-451] menciona que el objetivo de todo sistema de control de concurrencia es la ejecución de transacciones ACID, que se refiere a las propiedades de atomicidad, consistencia, aislamiento (isolation) y durabilidad. 

Atomicidad significa que la transacción es una sola unidad, falla o es exitosa como un todo, pero no puede finalizar en un estado intermedio. 

Consistencia se refiere a que toda transacción debe resultar en un base de datos con un estado consistente, es decir, que cumple todas las restricciones. 

Aislamiento se refiere a la propiedad de las transacciones de ser serializables. El efecto de correr ambas transacciones al mismo tiempo debería ser el mismo que si se ejecutaran en serie.

Finalmente, una transacción debe tener durabilidad, es decir, una vez que se ejecuta, sus resultados son persistentes y no se les puede hacer un rollback.

\pagebreak

# Sistemas de Bases de Datos Distribuidas

Cuando se habla de una base de datos distribuida (DDB) el término en cuestión se refiere a una colección de múltiples, lógicamente interrelacionadas bases de datos distribuidas en una red de computadores. Usualmente, la discusión respecto a las mismas también involucra a los sistemas de administración de bases de datos distribuidas (DDBMS), homólogos a los DBMS comunes pero especializados para hacer de la complejidad de los datos distribuidos algo transparente al usuario [@ozsu-2003, p.674]. Se llama sistema de base de datos distribuida(DDBS) a la combinación de una DDB y DDBMS.

Elmasri y Navathe [-@elmasri-2016, p. 873] señalan que para poder clasificar a una base de datos como un DDB se deben cumplir las siguientes condiciones:

- Conexión de nodos de bases de datos sobre una red de computadores: Se refiere a que debe haber varios equipos, llamados sitios o nodos. Estos sitios deben estar conectados por una red para transmitir datos y comandos entre sitios.

- Interrelación lógica de las bases de datos conectadas: Es necesario que la información en los distintos nodos esté relacionada de forma lógica.

- Posible ausencia de homogeneidad entre nodos conectados: No necesariamente todos los nodos son idénticos en términos de datos, hardware y software. 

La última condición es particularmente importante. No necesariamente una base de datos distribuida es de una arquitectura uniforme. Incluso la estructura de los datos puede variar de un sitio que almacena los datos en un modo relacional y otro que almacena datos en una estructura llave-valor.

Algunos ejemplos de bases de datos distribuidas incluyen opciones de bases de datos NoSQL distribuidas como Cassandra, ScyllaDB y mongoDB. también hay ejemplos SQL como Google Spanner, crateDB, CockroachDB, Yugabyte y Amazon Aurora [@scylla-2022].

En la implementación de sistemas de bases de datos distribuidas puede haber una variedad de sistemas operativos en uso, desde sistemas 
de uso general como Windows y Linux, hasta sistemas especializados como IBM i.

El grado de homogeneidad de una base de datos es uno de los primeros factores al clasificar este tipo de sistemas. Se tienen entonces dos variaciones en base a este criterio: bases de datos con un modelo distribuido homogéneo, y bases de datos con un modelo distribuido federado o heterogéneo. 

Cuando un modelo de datos distribuido se refiere a datos fragmentados en dispositivos similares en diferentes localidades, es llamado modelo homogéneo [@tupper-2011]. Lo anterior significa que el sistema es consistente en plataformas, protocolos e interfaces de comunicación, lo que también simplifica sustancialmente la implementación de este tipo de sistema. Una de las ventajas que presenta este tipo de sistema es que no hay necesidad de traducción o reformateo de datos, lo que puede ser una tarea sumamente complicada. 

![Modelo de una base de datos distribuida homogénea. Obtenido de Tupper, [-@tupper-2011].](./homogeneo.png)

El acercamiento contrario a un modelo homogéneo es el modelo heterogéneo o federado, en el que hay una distribución diversa de datos entre sistemas sustancialmente distintos en términos de software, estructura de datos, entre otras. Encontrar modelos relacionales, jerárquicos o de red no es algo poco común en un modelo heterogéneo. 

![Modelo de una base de datos distribuida federada/heterogénea.Obtenido de Tupper, [-@tupper-2011].](./heterogeneo.png)

Uno de los retos de los modelos heterogéneos es la heterogeneidad semántica. La misma ocurre cuando hay diferencias en significado, interpretación y uso estipulado de los datos. Este tipo de heterogeneidad impone la mayor dificultad en el diseño de esquemas globales [@elmasri-2016, p. 898].

En un modelo heterogéneo se busca optimizar tanto autonomía de cada componente, así como transparencia de la arquitectura general. Lo anterior se debe a que usualmente un modelo heterogéneo surge a partir de querer unificar varios sistemas distintos que han surgido por su propia cuenta, y debido a los requisitos funcionales de cada sistema, mantener su autonomía local es una prioridad y la forma en la que se trate de unificar a los distintos sistemas debe tratar de adaptarse a este requisito, pero sin comprometer su objetivo original de ser una interfaz simple a los datos de todos los sistemas en conjunto.

Uno de los retos más complejos de los sistemas de bases de datos distribuidos es el control de concurrencia. La propiedad de serialización solo se cumple para un grupo de transacciones cuando este es serializable en cada sitio, y el orden de la serialización es el mismo para todos los sitios. A esto último se le llama serializabilidad global [@ozsu-2003]. Existen tres formas de asegurar esta propiedad: lock centralizado, lock de copia primaria, y algoritmos de locking distribuido. 

Para el caso del lock centralizado, consiste en que una base de datos contiene una sola tabla de locks para todo el sistema. Es la solución más simple, pero tiene el problema de que presenta un único punto de falla y provoca un efecto de cuello de botella. 

El lock de copia primaria consiste en designar uno de los registros replicados como el primario, de forma que ese es el único que se necesita proteger para realizar una transacción. 

El último acercamiento a control de concurrencia son los algoritmos de locking distribuido, los cuales no tienen el problema de causar un problema de cuello de botella, pero lo que se ahorra en poder computacional se paga en complejidad de operación. 

Muchos problemas adicionales relacionados al control de concurrencia surgen en el entorno de DDBMS que no se encuentran en DMBS centralizados, entre ellos Elmasri y Navathe [@elmasri-2016, p. 854] mencionan:

- El tener que lidiar con múltiples copias de los ítems de datos: Se debe mantener la consistencia entre copia de los datos que se encuentran en distintos sitios. 

- Fallas en sitios individuales: El sistema debería seguir funcionando a pesar de la falla de un sub-nodo.

- Fallas en enlaces de comunicación: El sistema debe ser capaz de lidiar con situaciones en que la comunicación entre los distintos sitios es comprometida. 

- Ejecución de transacción distribuida: Se debe poder lidiar con la posibilidad de que un paso de una transacción multi-sitio falle en uno o más sitios.

- Deadlocks distribuidos: Los algoritmos de locking se deben adaptar de forma que se pueda evitar una situación de deadlock distribuido. 

Hasta este punto se ha discutido los retos que caracterizan a los sistemas de bases de datos distribuidas, por lo que se debe plantear cuales son las ventajas de estos sistemas.

Según Splunk [-@splunk-2022], Los sistemas de bases de datos distribuidas ofrecen las siguientes ventajas:

- Mayor flexibilidad: Es más fácil agregar mayor poder computacional al sistema según las necesidades.
- Fiabilidad: Un sistema distribuido bien diseñado soportar daños en uno o varios nodos sin ver su desempeño impactado con severidad.
- Rapidez aumentada: Mientras que en sistemas centralizados hay un efecto de cuello de botella entre más tráfico de datos se tenga, en el caso de los sistemas distribuidos escalar la capacidad de tráfico es más fácil
- Geo-distribución: La entrega de contenido distribuido es esencial tanto para los usuarios finales como las organizaciones. 

## Análisis de resultados

A partir de la información recolectada, se ha logrado determinar que una base de datos distribuida (DDBs) es una colección de diversas bases de datos interrelacionadas, las cuales son manejadas por los sistemas administradores de bases de datos (DDBMSs). Estas son clasificadas así cuando existe una conexión de distintos equipos o nodos interconectados de una manera lógica, donde cada uno de los nodos pueden ser distintos en términos de la distribución datos, del hardware y del software, ya que las DDBs no necesariamente deben ser uniformes y pueden tener una distribución de nodos muy distintos en términos del tipo de bases de datos (NoSQL/SQL) y sistema operativo (Windows /Linux/ IBM i), los cuales pueden trabajar en conjunto por medio de un DDBMS.

Se logró determinar que las DDBs se clasifican en dos tipos, las que tienen un modelo distribuido homogéneo, las cuales tienen nodos idénticos o similares en distintas localidades, lo cual garantiza su consistencia en plataforma, protocolos, interfaces y demás, que permite una simple implementación. El otro tipo, las que tienen un modelo distribuido heterogéneo o federado, sí hay nodos muy distintos, lo cual hace que exista una gran dificultad a la hora de comunicarse entre bases de datos por la heterogeneidad semántica que hay entre cada nodo. Estos surgen principalmente al querer unificar varios sistemas autónomos con requisitos y funcionalidades distintas, las cuales se unifican para tener una interfaz simple con todos los datos de los sistemas en conjunto.

En las DDBs heterogéneas se identificó que se tiene un gran problema en el control de concurrencia, especialmente para que exista una serialización global en todos los nodos. Para que exista esta serialización global, se enforzan en estos alguna de las tres formas que hay, por medio de un lock centralizado, en el que se continene una sola tabla de locks para todo el sistema, por medio de un lock de copia primaria, donde se designa uno de los registros replicados como el primario para que este sea el único que se necesite proteger a la hora de hacer transacciones, y por medio de un algoritmo de locking distribuido.

Se identificaron en la investigación las principales ventajas de las bases de datos distribuidas, donde se tiene que estas permiten una mayor flexibilidad, ya que se puede agregar mayor poder computacional y distintos nuevos nodos con sistemas y capacidades muy distintas. Estas también permiten una mayor fiabilidad, ya que, si el sistema es bien diseñado, se puede esperar que el sistema soporte daños en varios nodos sin que se afecte significativamente el desempeño de la DDB. Estas permiten una mayor rapidez, ya que a la hora de escalar la hora de escalar la capacidad tráfico, estas permiten un mejor manejo en comparación con las bases de datos centralizadas. Por último, estas bases de datos permiten una geo-distribución de las bases de datos, lo cual es esencial para muchos de los usuarios finales que utilizan las DDBs.

\pagebreak

# Conclusiones

- Se explicó puntualmente la definición del término base de datos y de sistema administrador de bases de datos, así como las propiedades necesarias de estas para ser consideradas de esta manera. Esto se realiza para tenerlos como conceptos base a la hora de describir más detalladamente las definiciones de las bases de datos distribuidas (DDBs) y de los sistemas administradores de bases de datos distribuidas (DDBMSs).

- Se describió los conceptos básicos de fragmentación y replicación en el contexto del diseño de sistemas de bases de datos, ya que estos son conceptos claves a la hora de entender los sistemas de bases de datos distribuidas.

- Se definieron los fundamentos teóricos para comprender el control de concurrencia, esto para el estudio de las bases de datos distribuidas, donde se vuelve más complejo su manejo al no tener los datos centralizados.

- Se describen las principales propiedades de los sistemas de control de concurrencia en las bases de datos, los cuales son las propiedades de atomicidad, consistencia, aislamiento y durabilidad. Estas se describen ya que son términos y conceptos clave para entender los problemas que los sistemas de bases de datos distribuidas llegan a tener al ser implementadas con los datos descentralizados.

- Se definió puntualmente qué exactamente es un sistema de bases de datos distribuido, así como sus diferencias comparado con un sistema de bases de datos centralizada regular.

- Se determinaron las condiciones que debe tener un sistema de bases de datos para que sea considerada como “distribuida”, esto según la distribución y conexión de nodos, la interrelación lógica de estos y la posible ausencia de homogeneidad entre estos.

- Se definió qué exactamente son los sistemas administradores de bases de dados distribuidas y cómo estas se comparan con los sistemas de administración bases de datos centralizadas, especialmente en términos del complejo manejo de los datos distribuidos en distintos nodos.

- Se determinó la clasificación de las bases de datos distribuidas entre las homogéneas y heterogéneas, en términos de la composición y naturaleza de los nodos que componen a las bases de datos distribuidas.

- Se identificó el principal problema de control de concurrencia y de serialización global para las bases de datos distribuidas heterogéneas, y las formas disponibles para la solución de estos retos.

- Se detallaron las principales ventajas que se tiene al utilizar las bases de datos distribuidas, en términos de su flexibilidad, fiabilidad, su fácil aumento de velocidad y su geo-distribución.

\pagebreak


# Recomendaciones


- Si se ve la necesidad de distribuir una base de datos en áreas geográficas muy grandes para el desarrollo y mantenimiento de aplicaciones, la implementación de un sistema de bases de datos distribuida es recomendada, ya que existe una mejor transparencia de la distribución y control de los datos.

- Se recomienda establecer un sistema de bases de datos distribuidas si ya se tiene múltiples bases de datos distintas y autónomas que deben ser consolidadas en una sola, ya que esto permite que cada una mantenga su autonomía y al mismo tiempo se consoliden los datos en una sola interfaz.

- Los sistemas de bases de datos distribuidas son modulares y escalables, lo cual permite agregar o eliminar nodos del sistema sin que sean afectados los demás, por lo que se recomienda estos si se va a tener en el futuro estas necesidades de expandir o reducir el tamaño de un sistema.

- Estos sistemas de bases de datos distribuidos son ideales para el procesamiento y análisis de datos, la minería de datos y algoritmos de machine learning, y para tecnología de big data, esto debido a que las bases de datos distribuidas fueron desarrolladas para lidiar con el almacenamiento, análisis y minería de grandes cantidades de datos e información.

- Si se desea tener un sistema de bases de datos con un nivel más bajo de complejidad, se recomienda utilizar un sistema distribuido homogéneo, ya que al tener todos los nodos siendo idénticos o iguales, se facilita el manejo de sintaxis y de comunicación entre ellos, simplificando substancialmente el trabajo necesario para su manejo y desarrollo.

- Si se desean desarrollar múltiples bases de datos de tipos distintos con funciones muy específicas, o con sistemas operativos distintos, se recomienda utilizar un sistema de bases de datos distribuido para el manejo y consolidación de todos estos y tener acceso a todos los datos manejados por cada uno de los nodos especializados.

- Se recomienda utiliza un sistema de bases de datos distribuida si se ve la necesidad en el futuro de poder expandir las capacidades de almacenamiento y procesamiento del sistema, ya que las bases de datos distribuidas tienen escalabilidad vertical, ya que se pueden agregar más nodos que cumplan la misma función y que se agrupen en una sola sub-red con la que interactúe el sistema distribuido.

- Debido a la capacidad de los sistemas de bases de datos distribuidas de localizar los datos en ciertos nodos o sub-redes de nodos específicos, se puede permitir una mejora en el desempeño o rendimiento, ya que las transacciones y queries locales pueden accesar a la información más fácil y rápidamente en su base de datos local.


\pagebreak

# Referencias


