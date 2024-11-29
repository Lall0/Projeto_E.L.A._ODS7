// URL base do backend
const baseURL = 'http://localhost:3000/posts';

// Função para exibir notificações
function exibirNotificacao(mensagem, tipo) {
    const notificationContainer = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensagem;

    notificationContainer.appendChild(notification);

    // Remove a notificação após 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Função para listar posts
async function listarPosts() {
    try {
        const response = await fetch(baseURL);
        const posts = await response.json();

        // Contêiner de posts
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = ''; // Limpa o conteúdo atual

        // Adiciona cada post ao contêiner
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.setAttribute('data-id', post._id); // Adiciona o identificador único
            postElement.innerHTML = `
                <h3>${post.titulo}</h3>
                <p>${post.conteudo}</p>
                <small>Autor: ${post.autor}</small>
                <button class="edit-btn" onclick="mostrarFormularioEdicao('${post._id}', '${post.titulo}', '${post.conteudo}')">Editar</button>
                <button class="delete-btn" onclick="confirmarExclusao('${post._id}')">Excluir</button>
                <div id="editForm-${post._id}" class="edit-form"></div>
            `;
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Erro ao listar posts:', error);
        exibirNotificacao('Erro ao carregar posts.', 'error');
    }
}

// Função para criar um novo post
async function criarPost(event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const conteudo = document.getElementById('conteudo').value;
    const autor = document.getElementById('autor').value;

    try {
        const response = await fetch(`${baseURL}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ titulo, conteudo, autor }),
        });

        if (response.ok) {
            exibirNotificacao('Post criado com sucesso!', 'success');
            listarPosts();
            document.getElementById('postForm').reset();
        } else {
            exibirNotificacao('Erro ao criar post.', 'error');
        }
    } catch (error) {
        console.error('Erro ao criar post:', error);
        exibirNotificacao('Erro ao criar post.', 'error');
    }
}

// Função para exibir o formulário de edição
function mostrarFormularioEdicao(id, tituloAtual, conteudoAtual) {
    const editFormContainer = document.getElementById(`editForm-${id}`);
    editFormContainer.innerHTML = `
        <form onsubmit="editarPost(event, '${id}')">
            <input type="text" id="editTitulo-${id}" value="${tituloAtual}" required>
            <textarea id="editConteudo-${id}" required>${conteudoAtual}</textarea>
            <button type="submit" class="save-btn">Salvar</button>
            <button type="button" class="cancel-btn" onclick="cancelarEdicao('${id}')">Cancelar</button>
        </form>
    `;
}

// Função para cancelar a edição
function cancelarEdicao(id) {
    const editFormContainer = document.getElementById(`editForm-${id}`);
    editFormContainer.innerHTML = '';
}

// Função para editar um post
async function editarPost(event, id) {
    event.preventDefault();

    const titulo = document.getElementById(`editTitulo-${id}`).value;
    const conteudo = document.getElementById(`editConteudo-${id}`).value;

    if (titulo && conteudo) {
        try {
            const response = await fetch(`${baseURL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo, conteudo }),
            });

            if (response.ok) {
                exibirNotificacao('Post atualizado com sucesso!', 'success');

                // Atualiza o DOM do post editado diretamente
                const postElement = document.querySelector(`[data-id="${id}"]`);
                if (postElement) {
                    postElement.querySelector('h3').textContent = titulo;
                    postElement.querySelector('p').textContent = conteudo;
                }

                cancelarEdicao(id); // Remove o formulário de edição
            } else {
                exibirNotificacao('Erro ao atualizar post.', 'error');
            }
        } catch (error) {
            console.error('Erro ao editar post:', error);
            exibirNotificacao('Erro ao atualizar post.', 'error');
        }
    }
}

// Função para confirmar exclusão
function confirmarExclusao(id) {
    exibirModalConfirmacao(id); // Exibe o modal para confirmar a exclusão
}

// Função para deletar um post
async function deletarPost(id) {
    try {
        const response = await fetch(`${baseURL}/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            exibirNotificacao('Post excluído com sucesso!', 'success');

            // Remove o post do DOM diretamente
            const postElement = document.querySelector(`[data-id="${id}"]`);
            if (postElement) {
                postElement.remove();
            }
        } else {
            exibirNotificacao('Erro ao excluir post.', 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar post:', error);
        exibirNotificacao('Erro ao excluir post.', 'error');
    }
}

// Evento ao enviar o formulário
document.getElementById('postForm').addEventListener('submit', criarPost);

// Listar posts ao carregar a página
listarPosts();

// Referências ao modal e botões
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

// Variável para armazenar o ID do post a ser excluído
let postToDelete = null;

// Função para exibir o modal
function exibirModalConfirmacao(id) {
    postToDelete = id; // Armazena o ID do post
    confirmModal.classList.remove('hidden'); // Exibe o modal
}

// Função para fechar o modal
function fecharModal() {
    postToDelete = null; // Reseta o ID do post
    confirmModal.classList.add('hidden'); // Oculta o modal
}

// Evento para confirmar a exclusão
confirmYes.addEventListener('click', async () => {
    if (postToDelete) {
        await deletarPost(postToDelete); // Chama a função de exclusão
        fecharModal();
    }
});

// Evento para cancelar a exclusão
confirmNo.addEventListener('click', fecharModal);


// Pesquisar entre as fontes

async function buscarPosts() {
    const termo = document.getElementById('searchInput').value.toLowerCase();

    try {
        const response = await fetch(baseURL);
        const posts = await response.json();

        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = ''; // Limpa os posts atuais

        const resultados = posts.filter(post =>
            post.titulo.toLowerCase().includes(termo) || 
            post.conteudo.toLowerCase().includes(termo)
        );

        if (resultados.length > 0) {
            resultados.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <h3>${post.titulo}</h3>
                    <p>${post.conteudo}</p>
                    <small>Autor: ${post.autor}</small>
                    <button class="edit-btn" onclick="mostrarFormularioEdicao('${post._id}', '${post.titulo}', '${post.conteudo}')">Editar</button>
                    <button class="delete-btn" onclick="confirmarExclusao('${post._id}')">Excluir</button>
                `;
                postsContainer.appendChild(postElement);
            });
        } else {
            postsContainer.innerHTML = '<p>Nenhum post encontrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        exibirNotificacao('Erro ao buscar posts.', 'error');
    }
}
