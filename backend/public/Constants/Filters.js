export const PROPERTY_FILTER_FIELDS = [
	{
		type: "SearchInput",
		label: "Pesquisar por titulo, endereço ou descrição",
		name: "searchKeyword",
		breakpoints: {
			lg: 12
		},
	},
	{
		type: "SelectBuilder",
		label: "Categorias",
		name: "categoryId",
		endpoint: "/categories",
		breakpoints: {
			lg: 12
		},
		dataMapper: ({ result }) => {
			return result.categories;
		}
	},
	{
		type: "SelectBuilder",
		label: "Finalidade",
		name: "finalityId",
		endpoint: "/finalities",
		breakpoints: {
			lg: 12
		},
		dataMapper: ({ result }) => {
			return result.finalities;
		}
	},
	{
		type: "SelectBuilder",
		label: "Proprietario",
		name: "ownerId",
		endpoint: "/owners",
		breakpoints: {
			lg: 12
		},
		dataMapper: ({ result }) => {
			return result.owners;
		}
	},
]

export const TASK_FILTER_FIELDS = [
	{
		type: "SearchInput",
		label: "Pesquisar por notas",
		name: "searchKeyword",
		breakpoints: {
			lg: 12
		},
	},
	{
		type: "SelectBuilder",
		label: "responsável",
		name: "user_id",
		endpoint: "/users",
		breakpoints: {
			lg: 12
		},
		dataMapper: ({ result }) => {
			return result.users;
		}
	},
	{
		type: "SelectInput",
		label: "Estado",
		name: "status",
		breakpoints: {
			lg: 12
		},
		data: [
			{ label: "🟢 Agendada", value: "scheduled" },
			{ label: "🔵 Confirmada", value: "confirmed" },
			{ label: "🟡 Pendente", value: "pending" },
			{ label: "🟣 Em Andamento", value: "in_progress" },
			{ label: "✅ Concluída", value: "completed" },
			{ label: "❌ Cancelada", value: "cancelled" },
			{ label: "🔄 Remarcada", value: "rescheduled" },
			{ label: "⏰ Não Compareceu", value: "no_show" },
		],
	},
]

export const VISIT_FILTER_FIELDS = [
	{
		type: "SearchInput",
		label: "Pesquisar por notas",
		name: "searchKeyword",
		breakpoints: {
			lg: 12
		},
	},
	{
		type: "SelectBuilder",
		label: "Agente responsável",
		name: "agent_id",
		endpoint: "/agents",
		breakpoints: {
			lg: 12
		},
		dataMapper: ({ result }) => {
			return result.agents;
		}
	},
	{
		type: "SelectBuilder",
		label: "Cliente",
		name: "client_id",
		endpoint: "/clients",
		breakpoints: {
			lg: 12
		},
		dataMapper: ({ result }) => {
			return result.clients;
		}
	},
	{
		type: "SelectBuilder",
		label: "Criado por",
		name: "user_id",
		endpoint: "/users",
		breakpoints: {
			lg: 12
		},
		dataMapper: ({ result }) => {
			return result.users;
		}
	},
	{
		type: "SelectInput",
		label: "Tipo de visita",
		name: "visit_type",
		breakpoints: {
			lg: 12
		},
		data: [
			{ label: "Primeira visita", value: "first_visit" },
			{ label: "Visita de acompanhamento", value: "follow_up" },
			{ label: "Visita técnica", value: "technical" },
			{ label: "Vistoria", value: "inspection" },
			{ label: "Assinatura", value: "signature" }
		],
	},
	{
		type: "SelectInput",
		label: "Estado",
		name: "status",
		breakpoints: {
			lg: 12
		},
		data: [
			{ label: "🟢 Agendada", value: "scheduled" },
			{ label: "🔵 Confirmada", value: "confirmed" },
			{ label: "🟡 Pendente", value: "pending" },
			{ label: "🟣 Em Andamento", value: "in_progress" },
			{ label: "✅ Concluída", value: "completed" },
			{ label: "❌ Cancelada", value: "cancelled" },
			{ label: "🔄 Remarcada", value: "rescheduled" },
			{ label: "⏰ Não Compareceu", value: "no_show" },
		],
	},
]

export const ROLE_FILTER_FIELDS = [
	{
		type: "SearchInput",
		label: "Pesquisar por privilégio",
		name: "searchKeyword",
		breakpoints: {
			lg: 12
		}
	},
]


export const USER_FILTER_FIELDS = [
	{
		type: "SearchInput",
		label: "Pesquisar por nome ou email",
		name: "searchKeyword",
		breakpoints: {
			lg: 12
		}
	},
	{
		type: "SelectBuilder",
		label: "Privilégios",
		name: "roleId",
		endpoint: "/roles",
		dataMapper: ({ result }) => {
			return result.roles;
		},
		breakpoints: {
			lg: 12
		}
	},
]

export const OWNER_FILTER_FIELDS = [
	{
		type: "SearchInput",
		label: "Pesquisar por nome, email ou endereço",
		name: "searchKeyword",
		breakpoints: {
			lg: 12
		}
	},
]

export const AGENT_FILTER_FIELDS = [
	{
		type: "SearchInput",
		label: "Pesquisar por nome ou contacto",
		name: "searchKeyword",
		breakpoints: {
			lg: 12
		}
	},
]


export const CATEGORY_FILTER_FIELDS = [
	{
		type: "SearchInput",
		label: "Pesquisar por nome",
		name: "searchKeyword",
		breakpoints: {
			lg: 12
		}
	},
]