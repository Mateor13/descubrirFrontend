import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { usuarios as api } from '../../api/v2'
import { erroresPorCampo, mensajeError } from '../../api/cliente'
import { useCarga } from '../../hooks/useCarga'
import { useSesion } from '../../context/Sesion'
import { Encabezado, Insignia, Tabla } from '../../componentes/ui/Pagina'
import { Modal, PieModal, Confirmar } from '../../componentes/ui/Modal'
import { Campo } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { Contenido, Vacio } from '../../componentes/ui/Estados'
import { ROLES, nombreCompleto } from '../../lib/formato'

const VACIO = { nombre: '', apellido: '', cedula: '', email: '', telefono: '', direccion: '', roles: [] }
const normalizar = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export const FormularioUsuario = ({ usuario, rolesIniciales = [], alGuardar, alCancelar }) => {
    const nuevo = !usuario
    const [form, setForm] = useState(usuario ? { ...VACIO, ...usuario } : { ...VACIO, roles: rolesIniciales })
    const [errores, setErrores] = useState({})
    const [guardando, setGuardando] = useState(false)
    const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    const alternarRol = (rol) => setForm({ ...form, roles: form.roles.includes(rol) ? form.roles.filter(r => r !== rol) : [...form.roles, rol] })

    const guardar = async (e) => {
        e.preventDefault()
        if (!form.roles.length) { setErrores({ roles: 'Seleccione al menos un rol' }); return }
        const campos = ['nombre', 'apellido', 'cedula', 'email', 'telefono', 'direccion']
        const datos = Object.fromEntries(campos.map(c => [c, form[c].trim()]))
        const cambios = nuevo
            ? { ...datos, roles: form.roles }
            : { ...Object.fromEntries(Object.entries(datos).filter(([k, v]) => v !== (usuario[k] ?? ''))), ...(form.roles.join() !== usuario.roles.join() && { roles: form.roles }) }
        if (!nuevo && !Object.keys(cambios).length) { alCancelar(); return }
        setGuardando(true)
        setErrores({})
        try {
            const resultado = nuevo ? await api.crear(cambios) : await api.actualizar(usuario.id, cambios)
            toast.success(nuevo ? `Cuenta creada. Se envió el enlace de activación a ${resultado.email}` : 'Usuario actualizado')
            alGuardar(resultado)
        } catch (err) {
            setErrores(erroresPorCampo(err))
            toast.error(mensajeError(err))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={guardar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Nombre" name="nombre" required autoComplete="off" value={form.nombre} onChange={cambiar} error={errores.nombre} />
                <Campo etiqueta="Apellido" name="apellido" required autoComplete="off" value={form.apellido} onChange={cambiar} error={errores.apellido} />
                <Campo etiqueta="Cédula" name="cedula" required inputMode="numeric" pattern="\d{10}" maxLength={10} value={form.cedula} onChange={cambiar} error={errores.cedula} ayuda="10 dígitos" />
                <Campo etiqueta="Teléfono" name="telefono" type="tel" required inputMode="numeric" pattern="\d{10}" maxLength={10} value={form.telefono} onChange={cambiar} error={errores.telefono} ayuda="10 dígitos" />
                <Campo etiqueta="Correo electrónico" name="email" type="email" required value={form.email} onChange={cambiar} error={errores.email} className="sm:col-span-2"
                    ayuda={nuevo ? 'Recibirá un enlace para activar su cuenta y crear su contraseña.' : undefined} />
                <Campo etiqueta="Dirección" name="direccion" required minLength={5} value={form.direccion} onChange={cambiar} error={errores.direccion} className="sm:col-span-2" />
            </div>
            <fieldset>
                <legend className="etiqueta">Roles</legend>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(ROLES).map(([rol, nombre]) => (
                        <label key={rol} className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-medium ring-1 ${form.roles.includes(rol) ? 'bg-verde-100 text-verde-900 ring-verde-600' : 'bg-white text-slate-700 ring-slate-300'}`}>
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-verde-700 focus:ring-verde-600" checked={form.roles.includes(rol)} onChange={() => alternarRol(rol)} />
                            {nombre}
                        </label>
                    ))}
                </div>
                <p className="mt-1 text-xs text-slate-600">Una persona puede tener varios roles (por ejemplo, profesor y representante).</p>
                {errores.roles && <p className="mt-1 text-xs font-medium text-red-700">{errores.roles}</p>}
            </fieldset>
            <PieModal>
                <button type="button" className="btn-secundario" onClick={alCancelar}>Cancelar</button>
                <Boton type="submit" cargando={guardando}>{nuevo ? 'Crear cuenta' : 'Guardar cambios'}</Boton>
            </PieModal>
        </form>
    )
}

const Usuarios = () => {
    const { usuario: yo } = useSesion()
    const [filtro, setFiltro] = useState({ rol: '', activo: true, texto: '' })
    const carga = useCarga(() => api.listar({ rol: filtro.rol, activo: filtro.activo }), [filtro.rol, filtro.activo])
    const [modal, setModal] = useState(null)
    const [procesando, setProcesando] = useState(false)

    const filtrados = useMemo(() => {
        const t = normalizar(filtro.texto.trim())
        if (!t) return carga.datos ?? []
        return (carga.datos ?? []).filter(u => normalizar(`${u.nombre} ${u.apellido} ${u.email} ${u.cedula}`).includes(t))
    }, [carga.datos, filtro.texto])

    const reenviar = async (u) => {
        try {
            await api.reenviarActivacion(u.id)
            toast.success(`Enlace de activación reenviado a ${u.email}`)
        } catch (err) { toast.error(mensajeError(err)) }
    }

    const desactivar = async () => {
        setProcesando(true)
        try {
            await api.desactivar(modal.usuario.id)
            toast.success('Cuenta desactivada')
            setModal(null)
            carga.recargar()
        } catch (err) { toast.error(mensajeError(err)) } finally { setProcesando(false) }
    }

    const columnas = [
        { titulo: 'Nombre', render: u => <span><span className="font-semibold">{nombreCompleto(u)}</span><span className="block text-xs font-normal text-slate-600">{u.email}</span></span> },
        { titulo: 'Cédula', render: u => u.cedula },
        { titulo: 'Roles', render: u => <span className="flex flex-wrap justify-end gap-1 md:justify-start">{u.roles.map(r => <Insignia key={r} tono={r === 'admin' ? 'morado' : r === 'profesor' ? 'verde' : 'azul'}>{ROLES[r]}</Insignia>)}</span> },
        { titulo: 'Cuenta', render: u => !u.activo ? <Insignia tono="gris">Desactivada</Insignia> : u.emailConfirmado ? <Insignia tono="verde">Activa</Insignia> : <Insignia tono="ambar">Pendiente de activar</Insignia> },
        {
            titulo: 'Acciones', clase: 'text-right', render: u => (
                <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" className="btn-secundario btn-sm" onClick={() => setModal({ tipo: 'editar', usuario: u })}>Editar</button>
                    {u.activo && !u.emailConfirmado && <button type="button" className="btn-fantasma btn-sm" onClick={() => reenviar(u)}>Reenviar enlace</button>}
                    {u.activo && u.id !== yo.id && <button type="button" className="btn-fantasma btn-sm text-red-700 hover:bg-red-50" onClick={() => setModal({ tipo: 'desactivar', usuario: u })}>Desactivar</button>}
                </div>
            )
        }
    ]

    return (
        <>
            <Encabezado titulo="Usuarios" descripcion="Cuentas de administración, docentes y representantes."
                acciones={<button type="button" className="btn-primario" onClick={() => setModal({ tipo: 'crear' })}><PlusIcon className="h-5 w-5" aria-hidden="true" />Nuevo usuario</button>} />
            <div className="tarjeta overflow-hidden">
                <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[2fr_1fr_1fr]">
                    <label className="relative">
                        <span className="sr-only">Buscar por nombre, email o cédula</span>
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                        <input type="search" className="control pl-10" placeholder="Buscar por nombre, email o cédula" value={filtro.texto} onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })} />
                    </label>
                    <select className="control" aria-label="Filtrar por rol" value={filtro.rol} onChange={(e) => setFiltro({ ...filtro, rol: e.target.value })}>
                        <option value="">Todos los roles</option>
                        {Object.entries(ROLES).map(([r, n]) => <option key={r} value={r}>{n}</option>)}
                    </select>
                    <select className="control" aria-label="Filtrar por estado" value={String(filtro.activo)} onChange={(e) => setFiltro({ ...filtro, activo: e.target.value === 'true' })}>
                        <option value="true">Activas</option>
                        <option value="false">Desactivadas</option>
                    </select>
                </div>
                <Contenido carga={carga}>
                    {() => filtrados.length === 0
                        ? <Vacio titulo="No hay usuarios con esos filtros" />
                        : <Tabla columnas={columnas} filas={filtrados} etiqueta="Usuarios" />}
                </Contenido>
            </div>

            <Modal abierto={modal?.tipo === 'crear' || modal?.tipo === 'editar'} alCerrar={() => setModal(null)} titulo={modal?.tipo === 'crear' ? 'Nuevo usuario' : 'Editar usuario'} ancho="max-w-2xl">
                {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
                    <FormularioUsuario usuario={modal.usuario} alCancelar={() => setModal(null)} alGuardar={() => { setModal(null); carga.recargar() }} />
                )}
            </Modal>
            <Confirmar abierto={modal?.tipo === 'desactivar'} alCerrar={() => setModal(null)} titulo="¿Desactivar la cuenta?" textoConfirmar="Desactivar" cargando={procesando} alConfirmar={desactivar}>
                {nombreCompleto(modal?.usuario)} perderá el acceso de inmediato. Sus registros (notas, observaciones) se conservan.
            </Confirmar>
        </>
    )
}

export default Usuarios
