export class PropertyUtils {
    static formatPrice(price) {
        if (!price || price <= 0) return "Preço sob consulta";
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    static createStatItem(icon, label, value) {
        return {
            icon,
            label,
            value
        };
    }

    static getMainImage(galleries) {
        return galleries?.find(img => img.isMain == 1) || galleries[0];
    }

    static shareProperty(property) {
        if (navigator.share) {
            navigator.share({
                title: property?.title,
                text: property?.description?.substring(0, 100) + '...',
                url: window.location.href,
            }).catch(console.error);
            return null;
        } else {
            navigator.clipboard.writeText(window.location.href);
            return "Link do imóvel copiado para a área de transferência!";
        }
    }

    static getPropertyStats(property) {
        return [
            this.createStatItem("fas fa-bed", "Quartos", property?.bedrooms || "-"),
            this.createStatItem("fas fa-bath", "Casas de banho", property?.bathrooms || "-"),
            this.createStatItem("fas fa-ruler-combined", "Área", property?.area ? `${property?.area} m²` : "-"),
            this.createStatItem("fas fa-car", "Garagens", property?.garages || "-"),
            this.createStatItem("fas fa-building", "Andar", property?.floor || "-")
        ];
    }
}