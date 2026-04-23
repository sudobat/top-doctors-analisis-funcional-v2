# Agendas y Citas

## Índice

1. [Creación de una Consulta](#1--creación-de-una-consulta)
2. [Servicios](#1-servicios)
  1. [Activación del Servicio](#11-activación-del-servicio)
3. [Configuración de la Consulta](#2-configuración-de-la-consulta)
4. [Activación de Telemedicina](#3-activación-de-telemedicina)
5. [Activación de Prepago](#4-activación-de-prepago)
6. [Configuración y vista en web](#5-configuración-y-vista-en-web)
  1. [Cita Presencial/Pago en Consulta/Slots Visibles](#1-cita-presencialpago-en-consultaslots-visibles)
  2. [Cita Presencial/Con Seguro/Con Slots Visibles](#2-cita-presencialcon-segurocon-slots-visibles)
  3. [Cita Presencial/Pago en Consulta/Sin Slots Visibles](#3-cita-presencialpago-en-consultasin-slots-visibles)
  4. [Cita Presencial/Con Seguro/Con Slots Visibles (duplicado en PDF)](#4-cita-presencialcon-segurocon-slots-visibles-duplicado-en-pdf)
  5. [Cita Presencial/Con Seguro/Sin Slots Visibles](#5-cita-presencialcon-seguro-sin-slots-visibles)
  6. [Cita Telemedicina/Prepago/Con Slots Visibles](#6-cita-telemedicinaprepagocon-slots-visibles)
  7. [Cita Telemedicina/Prepago/Sin Slots Visibles](#7-cita-telemedicinaprepagosin-slots-visibles)

## Implicado en

- **Web TD**: Perfil Doctor y Centros
- **Back Office**: Doctor y Centros

## 1.- Creación de una Consulta

### Admin - Doctor

Previamente se debe haber creado la **CONSULTA** desde la opción de Doctor en Admin.

### BackOffice del Doctor

Al acceder al Backoffice del Doctor se muestran las consultas activas que tiene configuradas desde el Admin, ya que para poder entrar al Backoffice el doctor debe estar activo y esto requiere disponer al menos de una consulta activa.

La configuración de la agenda se hace principalmente en dos secciones del Backoffice del doctor y hay otras 2 que se usan una sola ves:

- **Creación de una Consulta**
  - Admin -Doctor
  - BackOffice del Doctor
- **Activación del Servicio**
- **Configuración de la Consulta**
- **Activación de Telemedicina**
- **Configuración y vista web**

Tipo de Configuración de Consulta: **Doctor**

Secciones del Backoffice:

1. Servicios
2. Consultas y agendas
3. Telemedicina (solo se entra una sola vez para activar por primera vez la telemedicina)
4. Facturación - datos de facturación (solo se entra una sola vez para configurar los datos de facturación de telemedicina y prepago por primera vez)

## 1. Servicios

Al ingresar al Backoffice del doctor, en el menú se debe acceder al apartado **Servicios**, donde se muestra el listado de los servicios que tiene disponible el doctor.

Los servicios disponibles son los llamados **“Servicios TopDoctors”**: primera consulta y consulta de seguimiento. Cada doctor tiene estos servicios habilitados por cada especialidad que tenga configurada en el admin. Es decir, si un doctor tiene la especialidad de dermatología y cardiología, tendrá los siguientes servicios habilitados:

- Primera consulta dermatología
- Consulta de seguimiento dermatología
- Primera consulta cardiología
- Consulta de seguimiento cardiología

El listado de servicios se puede filtrar:

- **Barra de búsqueda de servicios**: texto libre; filtra por coincidencia en el nombre del servicio.
- **Campo de consultas**: muestra el listado de las consultas activas del doctor. Al seleccionar una, se muestran en el listado solo los servicios que tengan esa consulta activa.

Los servicios se muestran por defecto **desactivados**.

En el extremo derecho de cada servicio se muestra el icono de configuración para poder editar los servicios.

### 1.1 Activación del Servicio

El doctor puede decidir cómo configurar cada servicio y a qué consultas vincularlo. Por ejemplo, puede elegir que el servicio de primera visita esté disponible solo en una consulta y que el servicio de seguimiento esté disponible en varias (o al revés). Esta flexibilidad permite al doctor adaptar sus servicios a su forma de trabajo y a las necesidades de sus consultas.

Para activar un servicio:

1. Hacer click en el botón de configuración.
2. Se abre la página para editar el servicio. Se muestran los siguientes campos:
  - **a. Nombre del servicio**: no es editable.
  - **b. Descripción del servicio**: no es editable.
  - **c. Tratamientos**: los tratamientos seleccionados del doctor en su ficha del admin.
    - Es posible quitar alguno de los mostrados.
    - Es posible agregar tratamientos desde la barra de búsqueda.
    - Todo lo editado aquí se verá reflejado en la ficha del doctor del admin.
  - **d. IVA**:
    - Por defecto el switch de exento de IVA viene activado.
    - Si se desmarca, es obligatorio indicar el porcentaje de IVA en un campo numérico (valores entre 1 y 99).
    - El valor se muestra en el proceso de cita a modo informativo para el paciente.
  - **e. Consultas**:
    - Se muestran todas las consultas activas del doctor en el Admin.
    - Por defecto el switch de activación de servicio en cada consulta aparece desactivado.
    - Al activar una consulta para un servicio, se habilita la configuración por canal para esa combinación servicio-consulta.

Los canales que se muestran son los que estén seleccionados para la consulta activada (ver sección **2. Consultas y agendas**). Ejemplo: si la consulta solo tiene canal presencial, en la lista solo aparecerá presencial; si además tiene videoconsulta o mensajería, también aparecerán.

Por cada canal se muestran los siguientes campos:

- **Switch del canal**: por defecto inactivo.
- **Checkbox “Mostrar online”**: muestra el canal de atención para esa combinación de servicio y consulta en la web. Si no está marcado, el doctor podrá crear citas desde su backoffice, pero no aparecerá en la web para pacientes.
- **Checkbox “Mostrar precio”**:
  - Solo se muestra en el canal presencial y si el doctor en su consulta tiene configurado solo el pago en consulta.
  - Si tiene configurado prepago no se muestra (si se prepaga, el paciente siempre debe conocer el precio).
  - Si está marcado, se muestra el precio para esa combinación canal-servicio-consulta en el perfil del Doctor en TopDoctors.
- **Duración**: tiempo que duran las citas para esa combinación canal-servicio-consulta.
  - **Asegurados**: tiempo de atención para citas con seguro.
  - **Privadas**: tiempo de atención para citas de consulta privada.
- **Precio**:
  - **Pago en consulta**: precio que pagará el paciente en la consulta presencial. Solo se rellena para canal presencial; videoconsulta/chat siempre se prepagan.
  - **Prepago**: precio que pagará el paciente de modo anticipado.
    - En canal presencial, solo se habilita si el doctor tiene configurado el prepago en su consulta; debe ser igual o menor que el pago en consulta.
    - En telemedicina, siempre se completa el prepago (todas estas citas son prepagadas).
- **Notas**: campo editable opcional.
  - Se verá en el perfil de TopDoctors cuando se seleccione la combinación servicio-consulta que coincida con la nota.

Una vez completados los datos, hay que hacer clic en **“Guardar”** para registrar la configuración de ese servicio en esa consulta. Si se desea vincular el mismo servicio a otras consultas, se repite el proceso para cada consulta. Para otros servicios distintos, se sigue el mismo procedimiento para cada consulta a la que se quiera asociar cada servicio.

Solo después de que el servicio se ha configurado y vinculado a una consulta, es posible:

- Activar los switches del servicio en el listado.
- Activar el checkbox de **“mostrar en top doctors”** (para que el paciente lo vea en el perfil y pueda pedir citas).

Además, cuando el servicio está activo para una consulta, se muestra un círculo de color por cada consulta vinculada al servicio. Los colores son los vinculados a la consulta en la sección **2. Consultas y agendas**.

Si los servicios están mal configurados no se verán en el perfil de TopDoctors del doctor.

## 2. Configuración de la Consulta

Desde el Back Office del doctor, en la sección **Consultas y Agendas**, se muestra el listado de todas las consultas activas del doctor.

La consulta marcada con la estrella rellena es la **consulta principal**. Se puede modificar haciendo click en la estrella vacía de otra consulta. Al modificarlo desde aquí, también se modifica en el admin del doctor.

La consulta principal es:

- la que se muestra primero en el listado
- la que se muestra por defecto al entrar al perfil del doctor en la web

Es posible modificar el orden de las consultas en el perfil del doctor arrastrándolas mediante el ícono de líneas horizontales (drag & drop).

Al seleccionar una consulta, se ve su configuración:

- **Botón Editar**: habilita los campos de edición (necesario para editar).
- **Color**: por defecto azul; se puede personalizar para diferenciar consultas. Se muestra en:
  - listado de consultas del menú
  - calendario
  - servicios
- **Nombre de la consulta**: informativo; no se puede cambiar desde BO (solo desde admin).
- **Tratamientos**: informativo; no editable desde BO (solo desde admin).
- **Consultas configuradas con semanas alternas**: resumen de slots configurados por día.
- **Dirección, Ciudad, Código postal, Teléfono, Email**: datos de contacto/ubicación (solo editables desde admin).
  - Nota: Para cambiar cualquiera de ellos es necesario acceder al Admin y actualizar la información allí.
- **Tipo de pacientes**: no editable desde BO; se actualiza automáticamente en función del campo de Seguros.

### Tipo de Agenda

**Uso esta agenda para todos mis pacientes**

- Se utiliza cuando la agenda de TD es la única agenda del doctor o cuando los slots visibles en la web de TD son huecos reales.
- Todas las citas creadas desde la web se crean en estado **“Confirmado”**.

**Utilizo esta agenda solo para pacientes de TopDoctors**

- Se utiliza cuando la agenda de TD no es la agenda principal del doctor; gestiona citas en otra agenda.
- La disponibilidad en TopDoctors puede no ser real (puede haber solapes con la otra agenda).
- Las citas creadas desde la web se crean en estado **“Pendiente de confirmar por el doctor”** hasta revisión/confirmación manual.

### Tipos de citas

**Presencial**

- Opción por defecto.
- Si el doctor tiene configurado solo cita presencial, únicamente se mostrará este tipo en el perfil.

**Videoconsulta/Mensajería privada**

- Solo se muestran si el doctor previamente activó la telemedicina en su backoffice (ver sección **3. Activación de telemedicina**).
- Si se seleccionan, en el perfil web estará disponible pedir citas de telemedicina.

**Nota**: Los canales seleccionados aquí son los que se mostrarán habilitados para configurar en la sección de servicios para cada consulta.

### Asignar seguros médicos a esta consulta

Por defecto aparecen los seguros precargados en el Admin para esta consulta, pero el doctor puede quitar o añadir más seguros.

Con que se añada un seguro distinto a consulta privada, se marcará el checkbox de seguro médico en el apartado de tipo de paciente.

### Visita de niños

Por defecto se precarga con la configuración del Admin, pero puede modificarse desde el Backoffice del doctor.

Si el doctor cambia esta opción, la modificación se actualiza también en el Admin.

### Asignar servicios o tratamientos a esta consulta

Solo informativo. Se muestran únicamente los servicios activos y configurados para esa consulta (asociados y habilitados previamente).

Para editar, ir a la sección de servicios (ver **1. Servicios**).

### Mostrar online

Permite o no que los pacientes puedan pedir citas desde la web:

- Si está activo, el paciente podrá solicitar una cita desde la plataforma.
- Si está desactivado, la consulta seguirá visible en la web, pero en lugar del botón para agendar cita se mostrará únicamente el botón de llamar al doctor.

### Reservas de citas

- **Reservas de citas con calendario**: se muestran los slots disponibles y el paciente elige.
- **Cita online sin calendario (citas por email)**: no se muestran slots; el paciente solicita sin fecha/hora y el doctor propone.

### Tipo de pago

Aplica únicamente a citas presenciales y de consulta privada (no aplica a citas con seguro ni a telemedicinas).

- **Pago en consulta**: el paciente abona presencialmente.
- **Prepago**: el paciente abona durante el proceso de reserva en la web.
- **Pago en consulta y prepago**: el paciente puede elegir.

Nota: Para que se muestren opciones de prepago, desde el Admin (ficha del doctor) previamente se tiene que activar el switch de **“Puede usar Wallet”**.

### Márgenes

El doctor puede elegir los márgenes en los que quiere que se muestren citas en su perfil de TopDoctors según el tipo de paciente/cita.

**Primera cita disponible**

- Configura a partir de cuántos días vista desde hoy se mostrará la primera cita disponible.
  - `0`: si hay slots hoy, se podrá solicitar hoy.
  - `1`: el paciente podrá pedir para mañana.
- Por defecto: 2.
- Configurable entre 0 y 168 días.
- El cálculo no tiene en cuenta fines de semana ni festivos (si hoy es viernes y margen = 1, el primer slot será lunes).

**Última cita disponible**

- Límite hasta el cual se muestran slots disponibles en el calendario.
- Se configura en semanas (período continuo desde la fecha de inicio).
- Máximo: 52 semanas (1 año).
- Por defecto: 52 semanas.

Estos márgenes se pueden establecer por tipo de paciente/cita: citas de prepago, citas con pago en consulta/telemedicinas y citas con seguros. En función del tipo de cita seleccionado en la web de TD, el período de slots disponibles puede variar.

Ejemplo:

- margen min 0 y max 4 semanas para pacientes con seguro
- margen min 1 y max 24 semanas para pacientes con prepago

Entonces, si el paciente elige seguro verá citas hasta un mes; si elige privada con prepago verá citas hasta 6 meses.

### Citas recurrentes

Permite al doctor crear citas recurrentes desde su BO. Solo aplica a citas creadas por el doctor (el paciente no puede crear este tipo desde la web).

El doctor puede configurar entre 2 y 12 la cantidad de citas recurrentes que se permite crear.

Para ver cómo funciona esta opción, ir al documento.

### Permitir solapamiento de citas

Al habilitar esta opción desde su Backoffice, se permite agendar citas en un slot ya ocupado (ej.: kinesiólogos). Solo aplica a citas creadas por el doctor desde su Backoffice; el paciente no puede reservar en un slot ya ocupado.

El doctor puede configurar entre 2 y 4 la cantidad de citas que se pueden generar en un mismo slot.

Para ver cómo funciona esta opción, ir al documento.

### Horarios de la consulta

Se visualizan filas con el nombre de cada día de la semana junto a un switch de activación para habilitar/deshabilitar ese día en la agenda. Por defecto, los switches están desactivados.

Al activar un switch:

- se despliega un rango horario predeterminado (08:00 a 12:00) que puede modificarse.
- se pueden añadir tantos rangos como se quiera, siempre que **no se solapen** (ej.: no 08–12 y 11–15; sí 08–12 y 12:30–15).
- al lado de cada rango se muestra el icono de tuerca para ir a configuración.

**Switch “Mostrar online”**

- Si se activa, los slots del rango se muestran en el perfil web como disponibles.
- Si no se activa, no se muestran en la web; internamente el doctor verá el rango en su calendario y podrá crear citas manualmente.

**Icono de cesto de basura**: elimina el rango horario. Debe existir como mínimo un rango dentro de un día activo (no deja eliminar el último).

#### Configuración de los horarios (por rango)

Al hacer click en la tuerca, se abre la configuración de cada rango horario:

- **Tipos de pacientes**: se muestran los checkbox marcados según la consulta (ej.: privada y seguro). El doctor puede elegir solo atender privados en ese rango.
- **Tipos de cita**: se muestran los canales configurados en la consulta (ej.: presencial y videoconsulta). Puede elegir, por ejemplo, solo presencial.
  - Ej.: si el lunes 08–12 selecciona solo videoconsulta, en la web solo se mostrarán slots cuando el paciente elija videoconsulta.
- **Asignar seguros médicos**: se muestran los seguros vinculados a la consulta; puede elegir cuáles atender en ese rango.
- **Asignar servicios o tratamientos**: se muestran los servicios vinculados a la consulta; puede elegir cuáles atender en ese rango.

**Frecuencia de agenda**

- **Semanas alternas**: define con qué día del mes se muestran slots para ese rango.
  - Si se activa, se despliegan checkbox con los días del mes para seleccionar en qué semanas alternas se aplica.
  - Ej.: “primeros lunes del mes”: solo habrá slots el primer lunes.
- **Por intervalo de semanas**:
  - se calculan semanas de forma continua desde la fecha de inicio
  - se configura frecuencia (cada cuántas semanas), fecha de inicio y fecha de fin
  - ej.: cada 2 semanas: semana de inicio sí, siguiente no, siguiente sí, etc.

**Nota**: Los rangos configurados no deben coincidir con los de otra consulta del mismo doctor. Solo podrían “coincidir” si la frecuencia evita solapes (ej.: consulta 1 primeros lunes 10–11; consulta 2 segundos lunes 10–11).

**Recomendación**: realizar un guardado antes de la sección de horarios. Una vez guardado, editar de nuevo para configurar los horarios. Los horarios hay que guardarlos dos veces: en la configuración de día y luego en la configuración de la consulta.

## 3. Activación de Telemedicina

Para que se muestren las opciones de Videoconsulta y mensajería privada en la configuración de la consulta, primero el doctor debe activar la telemedicina en su backoffice.

Pasos:

1. Ir a la sección **“Telemedicina”**.
2. Click en **“activar telemedicina”**.
3. Se abre la pantalla de Términos y Condiciones de Uso de la telemedicina (aceptar).
4. Redirección a datos fiscales para completar los datos a los que se facturarán las telemedicinas.

Una vez hecho, aparecen las opciones de videoconsulta y mensajería privada en todas las consultas activas.

Este proceso se hace solo una vez. Los datos de facturación se pueden modificar en cualquier momento en **Facturas - Datos fiscales**.

## 4. Activación de Prepago

Para que aparezcan las opciones de pago **“prepago”** y **“pago en consulta y prepago”**, primero se debe activar el switch **“puede usar wallet”** en la ficha del doctor (Admin).

La primera vez que seleccione una de estas opciones en alguna consulta:

1. Se muestra un pop up con Términos y Condiciones del prepago (aceptar).
2. Redirección a datos fiscales para completar los datos a los que se facturarán los prepagos.

Este proceso se hace una sola vez. Los datos se pueden modificar en **Facturas - Datos fiscales**.

## 5. Configuración y vista en web

### Tipo de Configuración de Consulta

#### 1. Cita Presencial/Pago en Consulta/Slots Visibles

Configuración previa en BO del Doctor (consulta):

- Switch **“Mostrar Online”** activo.
- Radio **“Reserva de citas con Calendario”**.
- Radio **“Pago en Consulta”**.
- Horarios añadidos y switch **“Mostrar online”** activo en el rango.

Configuración previa en BO del Doctor (servicios):

- Activar switch de la consulta en servicios.
- Activar switch del tipo de cita **“Presencial”**.
- Marcar:
  - **Mostrar online**
  - **Mostrar precio**
- Completar:
  - **Duración**: añadir rango horario para privados
  - **Precio**: añadir pago en consulta
  - (Opcional) **nota**

Vista preliminar.

#### 2. Cita Presencial/Con Seguro/Con Slots Visibles

Configuración previa en BO del Doctor:

- Switch **“Mostrar Online”** activo.
- Radio **“Reserva de citas con Calendario”**.
- Con **PRESENCIAL**
- Con **Seguros**
- Con **Slots visibles**

En **Asignar seguros médicos a esta consulta**, debe haber al menos un seguro aparte de **Consulta Privada**.

Vista preliminar.

#### 3. Cita Presencial/Pago en Consulta/Sin Slots Visibles

Manteniendo la configuración de servicios del punto 1, configurar en BO del doctor:

- Switch **“Mostrar Online”** activo.
- Radio **“Reserva de citas sin Calendario”**.
- Con **PRESENCIAL**
- **Pago en Consulta**
- **Sin Slots visibles**

Vista preliminar.

La cita se gestionará vía email. Tras recibir la solicitud, se notifica al doctor, quien designa fecha y hora y se envía un email al paciente para su confirmación. Si el paciente rechaza la propuesta, se enviará una nueva solicitud con una fecha/hora alternativa.

#### 4. Cita Presencial/Con Seguro/Con Slots Visibles (duplicado en PDF)

El PDF lista este tipo (4) sin contenido adicional, y luego continúa con el tipo (5).

#### 5. Cita Presencial/Con Seguro/ Sin Slots Visibles

Manteniendo la configuración de servicios del primer tipo, configurar previamente en el Back Office del doctor:

- Switch **“Mostrar Online”** activo.
- Radio **“Reserva de citas sin Calendario”**.
- Radio **“Pago en Consulta”**.
- Desde el Admin, en la Consulta deben estar configurados los seguros.
- Vista en BO del doctor del tipo de paciente: **Seguros**.

Combinaciones indicadas:

- **Con PRESENCIAL / Con Seguros / Con Slots visibles**
- **Con PRESENCIAL / Con Seguros / Sin Slots visibles**

Vista preliminar.

**Nota**: Cuando el método de pago es a través de un seguro, el **Precio** no se visualizará, incluso si “mostrar precio” está activado.

La cita se gestiona vía email (igual que el tipo 3).

#### 6. Cita Telemedicina/Prepago/Con Slots Visibles

- Con **TELEMEDICINA**
- **Prepago**
- **Con Slots visibles**

Configuración previa en BO del Doctor (servicios):

- Activar switch de la consulta en servicios.
- Activar switch del tipo de cita **“Videoconsulta”** y **“Chat Privado”**.
- Marcar **Mostrar online**.
- Completar:
  - **Duración**: añadir rango horario para asegurados y privados
  - **Precio**: (según texto del PDF)
  - (Opcional) nota

Configuración previa en BO del Doctor (consulta):

- Switch **“Mostrar Online”** activo.
- Radio **“Reserva de citas sin Calendario”**.

Vista preliminar.

**Nota**: Cuando el tipo de cita es Telemedicina/Mensajería, siempre se visualizará el precio.

#### 7. Cita Telemedicina/Prepago/Sin Slots Visibles

Configuración previa en BO del Doctor (servicios telemedicina/mensajería):

- Activar switch de la consulta en servicios.
- Activar switch del tipo de cita **“Videoconsulta”** y **“Chat Privado”**.
- Marcar **Mostrar online**.
- Completar:
  - **Duración**: añadir rango horario para asegurados y privados
  - **Precio**: (según texto del PDF)
  - (Opcional) nota

Combinación:

- Con **TELEMEDICINA**
- **Prepago**
- **Sin Slots visibles**

Configuración previa en BO del Doctor (consulta):

- Switch **“Mostrar Online”** activo.
- Radio **“Reserva de citas sin Calendario”**.
- Radio **“Pago en Consulta”** (así aparece en el PDF).

Vista preliminar:

- Si el Doctor tiene configurado **Presencial** y **Telemedicina**, por defecto se muestra seleccionado el tab **“Cita presencial”**.
- Si la configuración es presencial, los slots se visualizan en color **naranja**; si es telemedicina, en color **azul**.

### Vista general

Si el doctor tiene configuradas otras consultas, su visualización dependerá del tipo de cita que se seleccione.

**Pestañas del tipo de servicio**

- Si se elige **Cita Presencial**, el desplegable muestra únicamente consultas activas con ese tipo de cita.
- Si se elige **Telemedicina**, el desplegable muestra únicamente consultas activas con ese tipo de cita.

Si se indicó previamente que se muestren los precios:

- **Consulta**: se despliegan todas las consultas generadas por el Doctor.
- **Método de pago**:
  - **Seguro**: no se muestra el precio.
  - **Pago en consulta**: precio en color azul (valor a cobrar en la consulta).
  - **Prepago**: precio en color verde al costado del servicio/consulta seleccionada.
- **Tipo de servicio**: se despliegan los servicios configurados para cada consulta.
  - Si el doctor seleccionó **Mostrar Precio**, se mostrará al lado de la descripción del servicio.

