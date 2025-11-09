import { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import TablaClientes from "../components/clientes/TablaClientes";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import ModalRegistroCliente from "../components/clientes/ModalRegistroCliente";
import ModalEdicionClienre from "../components/clientes/ModalEdicionCliente";
import ModalEliminacionCliente from "../components/clientes/ModalEliminacionCliente";
import ModalEdicionCliente from "../components/clientes/ModalEdicionCliente";


const Clientes = () => {

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [clienteEditado, setClienteEditado] = useState(null);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  const [paginaActual, establecerPaginaActual] = useState(1);
  const elementosPorPagina = 5; // Número de productos por página


  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    celular: '',
    direccion: '',
    cedula: ''
  });


  // Calcular clientes paginados
  const clientesPaginados = clientesFiltrados.slice(
  (paginaActual - 1) * elementosPorPagina,
  paginaActual * elementosPorPagina
  );

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
  };



  const agregarCliente = async () => {
    if (!nuevoCliente.primer_nombre.trim()) return;

    try {
      const respuesta = await fetch('http://localhost:3002/api/registrarcliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
      });

      if (!respuesta.ok) throw new Error('Error al guardar');

      // Limpiar y cerrar
      setNuevoCliente({
        primer_nombre: '', segundo_nombre: '', primer_apellido: '',
        segundo_apellido: '', celular: '', direccion: '', cedula: ''
      });
      setMostrarModal(false);

      await obtenerClientes(); // Refresca la lista
    } catch (error) {
      console.error("Error al agregar cliente:", error);
      alert("No se pudo guardar el cliente. Revisa la consola.");
    }
  };

  const obtenerClientes = async () => {

    try {
      const respuesta = await fetch('http://localhost:3002/api/clientes');
      if (!respuesta.ok) {
        throw new Error('Error al obtener los clientes');
      }

      const datos = await respuesta.json();

      setClientes(datos);
      setClientesFiltrados(datos);
      setCargando(false);


    } catch (error) {
      console.log(error.message);
      setCargando(false);

    }
  }

  const manejarCambioBusqueda = (e) => {
    const texto = e.target.value.toLowerCase(); // Obtiene el texto del input y lo pasa a minúsculas
    setTextoBusqueda(texto); // Actualiza el estado con el texto de búsqueda

    const filtrados = clientes.filter(
      (cliente) =>
        cliente.primer_nombre.toLowerCase().includes(texto) ||
        cliente.segundo_nombre.toLowerCase().includes(texto) ||
        cliente.primer_apellido.toLowerCase().includes(texto) ||
        cliente.segundo_apellido.toLowerCase().includes(texto) ||
        cliente.celular.toLowerCase().includes(texto) ||
        cliente.direccion.toLowerCase().includes(texto) ||
        cliente.cedula.toLowerCase().includes(texto)
    );

    setClientesFiltrados(filtrados); // Actualiza el estado con las categorías filtradas
  };


  // 🔹 Guardar edición
  const guardarEdicion = async () => {
    if (!clienteEditado?.primer_nombre.trim()) return;

    try {
      const respuesta = await fetch(
        `http://localhost:3002/api/actualizarClientePatch/${clienteEditado.id_cliente}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clienteEditado),
        }
      );

      if (!respuesta.ok) throw new Error("Error al actualizar");

      setMostrarModalEdicion(false);
      await obtenerClientes();
    } catch (error) {
      console.error("Error al editar categoría:", error);
      alert("No se pudo actualizar el cliente.");
    }
  };


  // 🔹 Abrir modal de eliminación
  const abrirModalEliminacion = (cliente) => {
    setClienteAEliminar(cliente);
    setMostrarModalEliminar(true);
  };

  // 🔹 Confirmar eliminación
  const confirmarEliminacion = async () => {
    try {
      const respuesta = await fetch(
        `http://localhost:3002/api/eliminarcliente/${clienteAEliminar.id_cliente}`,
        {
          method: "DELETE",
        }
      );

      if (!respuesta.ok) throw new Error("Error al eliminar");

      setMostrarModalEliminar(false);
      setClienteAEliminar(null);
      await obtenerClientes();
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      alert("No se pudo eliminar el cliente.");
    }
  };

  // 🔹 Abrir modal de edición
  const abrirModalEdicion = (cliente) => {
    setClienteEditado({ ...cliente });
    setMostrarModalEdicion(true);
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  return (
    <>
      <Container className="mt-4">
        <h4>Clientes</h4>

        <Row>
          <Col lg={5} md={8} sm={8} xs={7}>
            <CuadroBusquedas
              textoBusqueda={textoBusqueda}
              manejarCambioBusqueda={manejarCambioBusqueda}
            />
          </Col>
          <Col className="text-end">
            <Button
              variant="primary"
              onClick={() => setMostrarModal(true)}
            >
              + Nuevo Cliente
            </Button>
          </Col>
        </Row>

        <TablaClientes
          clientes={clientesFiltrados}
          cargando={cargando}
          abrirModalEdicion={abrirModalEdicion}
          abrirModalEliminacion={abrirModalEliminacion}
          totalElementos={clientes.length} // Total de categorias
          elementosPorPagina={elementosPorPagina} // Elementos por página
          paginaActual={paginaActual} // Página actual
          establecerPaginaActual={establecerPaginaActual} // Método para cambiar página
        />
        <ModalRegistroCliente
          mostrarModal={mostrarModal}
          setMostrarModal={setMostrarModal}
          nuevoCliente={nuevoCliente}
          manejarCambioInput={manejarCambioInput}
          agregarCliente={agregarCliente}
        />

        {/* Modal de edición */}
        <ModalEdicionCliente
          mostrar={mostrarModalEdicion}
          setMostrar={setMostrarModalEdicion}
          clienteEditado={clienteEditado}
          setClienteEditado={setClienteEditado}
          guardarEdicion={guardarEdicion}
        />

        {/* Modal de eliminación */}
        <ModalEliminacionCliente
          mostrar={mostrarModalEliminar}
          setMostrar={setMostrarModalEliminar}
          cliente={clienteAEliminar}
          confirmarEliminacion={confirmarEliminacion}
        />
      </Container>
    </>
  );
}
export default Clientes;