import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

const IP = "18.229.126.103";

const BASE_URL = `https://${IP}:8080`;


export default function PessoasApp() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nota, setNota] = useState("");
  const [nomeProfessor, setNomeProfessor] = useState("");

  const {
    user,
    isAuthenticated,
    getAccessTokenSilently
  } = useAuth0();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
        
        // Decodificar token para verificar roles
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const roles = payload["https://dev-c5cya7ea1phr4j8p.us.auth0.com/roles"] || [];
        console.log(accessToken);
        setIsAdmin(roles.includes("ADMIN"));
      } catch (e) {
        console.error('Erro ao buscar token:', e);
      }
    };

    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (token) {
      fetchCursos();
    }
  }, [token]);


  if (!isAuthenticated) {
    return <LoginButton />;
  }

  async function fetchCursos() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/cursos`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Erro ao carregar: ${res.status}`);
      const data = await res.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);

    const dto = {
      nome: nome || null,
      descricao: descricao || null,
      nota: nota ? parseFloat(nota) : null,
      nomeProfessor: nomeProfessor || null
    };

    try {
      const res = await fetch(`${BASE_URL}/cursos`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
         },
        body: JSON.stringify(dto)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao criar: ${res.status} ${text}`);
      }

      const created = await res.json();
      setCursos(prev => [created, ...prev]);

      setNome("");
      setDescricao("");
      setNota("");
      setNomeProfessor("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Tem certeza que deseja excluir este curso?")) {
      return;
    }

    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/cursos/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Apenas administradores podem excluir cursos");
        }
        throw new Error(`Erro ao excluir: ${res.status}`);
      }

      setCursos(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">

      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <LogoutButton />
      </div>


      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Cursos — criação e listagem</h1>

        <form onSubmit={handleCreate} className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do curso" className="p-2 border rounded" />
            <input value={nomeProfessor} onChange={e => setNomeProfessor(e.target.value)} placeholder="Nome do professor" className="p-2 border rounded" />
          </div>

          <div>
            <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição" className="w-full p-2 border rounded" />
          </div>

          <div>
            <input type="number" min="0" max="5" step="0.1" value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota (0 a 5)" className="p-2 border rounded" />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Criar</button>
            <button type="button" onClick={fetchCursos} className="px-4 py-2 bg-gray-200 rounded">Recarregar</button>
          </div>
        </form>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div>
          <h2 className="text-xl font-semibold mb-2">Lista de Cursos</h2>

          {loading ? (
            <div>Carregando...</div>
          ) : cursos.length === 0 ? (
            <div>Nenhum curso encontrado.</div>
          ) : (
            <ul className="space-y-3">
              {cursos.map((curso) => (
                <li key={curso.id} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold">{curso.nome}</div>
                      {curso.descricao && <div className="text-sm text-gray-600 mt-1">{curso.descricao}</div>}
                      <div className="text-sm text-gray-500 mt-1">Professor: {curso.nomeProfessor || "-"}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-medium">Nota: {curso.nota ?? "-"}</div>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(curso.id)}
                          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}