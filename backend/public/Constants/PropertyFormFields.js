import { Container } from "../../src/widgets/layouts/Container";
import { PropertyService } from "../Services/PropertyService";

// PropertyFormFields.js
export const getPropertyDetailsFields = () => [
  { type: "TextInput", label: "Título do Imóvel", name: "title", breakpoints: { lg: 7 }, required: true },
  { type: "TextInput", label: "Preço", name: "price", breakpoints: { lg: 3 } },
  { type: "SelectBuilder", endpoint: "/currencies", label: "Moeda", placeholder: "Informe a moeda", name: "currency_id", dataMapper: ({ result }) => { return result.currencies }, breakpoints: { lg: 2 } },
  { type: "TextInput", label: "Quartos", name: "room", breakpoints: { lg: 4 } },
  { type: "TextInput", label: "Casas de banho", name: "bathroom", breakpoints: { lg: 4 } },
  { type: "TextInput", label: "Área (m²)", name: "area", breakpoints: { lg: 4 } },
  { type: "SelectBuilder", endpoint: "/categories", label: "Categoria", placeholder: "Informe a categoria", name: "category_id", dataMapper: ({ result }) => { return result.categories }, breakpoints: { lg: 3 } },
  { type: "SelectBuilder", endpoint: "/finalities", label: "Finalidade", placeholder: "Informe a finalidade", name: "finality_id", dataMapper: ({ result }) => { return result.finalities }, breakpoints: { lg: 3 } },
  { type: "SelectBuilder", endpoint: "/owners", label: "Proprietário", placeholder: "Informe o proprietário", name: "owner_id", dataMapper: ({ result }) => { return result.owners }, breakpoints: { lg: 3 } },
  { type: "SelectBuilder", endpoint: "/owners", label: "Responsável", placeholder: "Informe o responsável", name: "responsible_id", dataMapper: ({ result }) => { return result.owners }, breakpoints: { lg: 3 } },
  { type: "TextAreaInput", label: "Descrição do Imóvel", name: "description", breakpoints: { lg: 12 } },
];

export const getAddressFields = () => [
  { type: "TextInput", label: "Endereço do Imóvel", name: "address", breakpoints: { lg: 9 }, required: true },
  { type: "SelectBuilder", endpoint: "/neighborhoods", label: "Bairro", placeholder: "Informe o bairro", name: "neighborhood_id", dataMapper: ({ result }) => { return result.neighborhoods }, breakpoints: { lg: 3 } },
  {
    type: "Custom",
    name: "map",
    breakpoints: { lg: 12 },
    component: new Container({
      style: { height: "25rem", width: "100%" },
      onMounted: async (el) => {
        const { MapService } = await import("../Services/MapService");
        await MapService.initMap(el);
      },
    }),
  },
];

export const getPropertyFeaturesFields = async (formData = {}) => {
  const { result } = await PropertyService.getPropertyFeatures();
  const propertyFeatures = result.propertyFeatures.data;

  return propertyFeatures?.map((feature) => ({
    type: "CheckBoxInput",
    label: feature.name,
    name: `feature_${feature.id}`,
    checked: formData[`feature_${feature.id}`] || false,
  }));
}

export const getPublishAndShareFields = () => [
  { type: "CheckBoxInput", label: "Publicar no website", name: "website", checked: true },
  { type: "CheckBoxInput", label: "Publicar no Facebook", name: "facebook" },
  { type: "CheckBoxInput", label: "Publicar no LinkedIn", name: "linkedin" },
  { type: "CheckBoxInput", label: "Partilhar com Proprietário", name: "owner" },
  { type: "CheckBoxInput", label: "Partilhar no Google Sheets", name: "google_sheets" },
];