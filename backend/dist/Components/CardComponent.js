import { BaseWidget } from "../../src/core/BaseWidget";
import { Text } from "../../src/widgets/elements/Text";
import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { STYLES } from "../Constants/STYLES";

// Common DetailItem component
export const DetailItem = ({ label, value, valueColor }) => {
  return new Column({
    style: STYLES.detailItem,
    children: [
      new Text({
        style: STYLES.detailLabel,
        text: label
      }),
      value instanceof BaseWidget ? value : new Text({
        style: { ...STYLES.detailValue, color: valueColor || STYLES.detailValue.color },
        text: value || "N/A"
      })
    ]
  });
};

// Common StatusBadge component
export const StatusBadge = ({ status, type = 'verification' }) => {
  let badgeStyle;
  let icon;
  let text;

  switch (type) {
    case 'payment':
      switch (status) {
        case 'paid':
          badgeStyle = STEPS.successBadge;
          icon = "fa fa-check-circle";
          text = "Pago";
          break;
        case 'overdue':
          badgeStyle = STYLES.overdueBadge;
          icon = "fa fa-exclamation-circle";
          text = "Vencido";
          break;
        default:
          badgeStyle = STYLES.pendingBadge;
          icon = "fa fa-clock";
          text = "Pendente";
      }
      break;
    case 'verification':
    default:
      if (status) {
        badgeStyle = STYLES.verifiedBadge;
        icon = "fa fa-check-circle";
        text = "Verificado";
      } else {
        badgeStyle = STYLES.unverifiedBadge;
        icon = "fa fa-x-circle";
        text = "Não verificado";
      }
  }

  return new  Container({
    style: badgeStyle,
    children: [
      new Icon({ icon, size: 14 }),
      new Text({ text })
    ]
  });
};

// Common Card component
export const CardComponent = ({ children, type = 'default', style = {} }) => {
  let cardStyle = { ...STYLES.card, ...style };

  switch (type) {
    case 'bank':
      cardStyle = { ...cardStyle, ...STYLES.bankCard };
      break;
    case 'disbursement':
      cardStyle = { ...cardStyle, ...STYLES.disbursementCard };
      break;
    case 'employee':
    case 'loan':
      cardStyle = { ...cardStyle, ...STYLES.employeeCard };
      break;
    case 'info':
    default:
      cardStyle = { ...cardStyle, ...STYLES.infoCard };
  }

  return new Container({
    style: cardStyle,
    children
  });
};

// Common SectionHeader component
export const SectionHeader = ({ icon, text }) => {
  return new Text({
    style: STYLES.sectionTitle,
    text: `${icon} ${text}`
  });
};