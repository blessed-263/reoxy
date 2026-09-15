import { PaymentMethod } from '../types';
import { REOXY_COMPANY } from '../data/companyInfo';
import { MICOR_TRAVELS_INFO } from '../data/micorTravelsInfo';

export interface PaymentInstructionBlock {
  bankLabel: string;
  bankName: string;
  accountName?: string;
  accountLabel: string;
  accountNumber?: string;
  referenceCode: string;
  paymentNotice: string;
}

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string; labelRu: string }[] = [
  { value: 'sberbank', label: 'Sberbank / SBP', labelRu: 'Сбербанк / СБП' },
  { value: 'tinkoff', label: 'Tinkoff Bank', labelRu: 'Т-Банк (Тинькофф)' },
  { value: 'bank_card', label: 'Bank Card (Debit/Credit)', labelRu: 'Банковская карта' },
  { value: 'cash', label: 'Cash at Consular Desk', labelRu: 'Наличные' },
  { value: 'ecocash', label: 'EcoCash / Zimbabwe Mobile', labelRu: 'EcoCash' },
  { value: 'wire_transfer', label: 'University / Wire Transfer', labelRu: 'Банковский перевод' },
];

export function paymentMethodLabelRu(method?: string): string {
  return PAYMENT_METHOD_OPTIONS.find((item) => item.value === method)?.labelRu || 'Не указан';
}

const REOXY_PHONE = REOXY_COMPANY.contacts.primaryPhone;
const REOXY_PAYEE = REOXY_COMPANY.name;

export function receiptPaymentInstructions(
  method: PaymentMethod | string | undefined,
  receiptId: string
): PaymentInstructionBlock {
  const referenceCode = `REOXY-${receiptId}`;

  switch (method) {
    case 'tinkoff':
      return {
        bankLabel: 'Банк',
        bankName: 'Т-Банк (Тинькофф) / СБП',
        accountName: REOXY_PAYEE,
        accountLabel: 'Счёт / Тел (СБП)',
        accountNumber: REOXY_PHONE,
        referenceCode,
        paymentNotice:
          'Оплата переводом в Т-Банк (Тинькофф) или по СБП. В комментарии укажите номер квитанции. Официальный расчётный документ выдаётся и скрепляется печатью бюро после подтверждения зачисления.',
      };
    case 'bank_card':
      return {
        bankLabel: 'Способ',
        bankName: 'Банковская карта (Visa / Mastercard / МИР)',
        accountName: REOXY_PAYEE,
        accountLabel: 'Касса / терминал',
        accountNumber: 'Оплата картой в бюро или по ссылке',
        referenceCode,
        paymentNotice:
          'Оплата банковской картой на кассе бюро или по защищённой платёжной ссылке. Квитанция скрепляется печатью после успешного списания. Банковский перевод на эту квитанцию не применяется.',
      };
    case 'cash':
      return {
        bankLabel: 'Способ',
        bankName: 'Наличные в бюро / консульский стол',
        accountName: REOXY_PAYEE,
        accountLabel: 'Место оплаты',
        accountNumber: `Касса ${REOXY_PAYEE}, ${REOXY_COMPANY.contacts.address}`,
        referenceCode,
        paymentNotice:
          'Оплата наличными при получении документов. Квитанция выдаётся сразу и скрепляется печатью бюро. Безналичный перевод по данной квитанции не принимается.',
      };
    case 'ecocash':
      return {
        bankLabel: 'Сервис',
        bankName: 'EcoCash / Zimbabwe Mobile Money',
        accountName: REOXY_PAYEE,
        accountLabel: 'Кошелёк / Тел',
        accountNumber: REOXY_PHONE,
        referenceCode,
        paymentNotice:
          'Оплата через EcoCash. В примечании к переводу укажите номер квитанции и ФИО заказчика. Документ подтверждается после поступления средств на кошелёк бюро.',
      };
    case 'wire_transfer':
      return {
        bankLabel: 'Банк',
        bankName: 'Банковский / университетский перевод',
        accountName: REOXY_PAYEE,
        accountLabel: 'ИНН / ОГРН',
        accountNumber: `ИНН ${REOXY_COMPANY.inn} • ОГРН ${REOXY_COMPANY.ogrn}`,
        referenceCode,
        paymentNotice:
          'Безналичный перевод от вуза или организации. В назначении платежа обязательно укажите номер квитанции и ФИО заказчика. Документы выдаются после зачисления на расчётный счёт бюро.',
      };
    case 'sberbank':
    default:
      return {
        bankLabel: 'Банк',
        bankName: 'ПАО Сбербанк / СБП',
        accountName: REOXY_PAYEE,
        accountLabel: 'Счёт / Тел (СБП)',
        accountNumber: REOXY_PHONE,
        referenceCode,
        paymentNotice:
          'Оплата через Сбербанк Онлайн или СБП по номеру телефона. В назначении платежа укажите номер квитанции. Документ скрепляется печатью бюро после зачисления средств.',
      };
  }
}

export function ticketPaymentInstructions(
  method: PaymentMethod | string | undefined,
  pnr: string,
  paymentStatus?: string
): PaymentInstructionBlock {
  const referenceCode = `PNR-${pnr}`;
  const payee = MICOR_TRAVELS_INFO.legalName;
  const phone = MICOR_TRAVELS_INFO.phone;
  const statusNote =
    paymentStatus === 'paid'
      ? 'Тариф оплачен полностью.'
      : paymentStatus === 'deposit_paid'
        ? 'Внесён депозит; остаток подлежит оплате до выписки билета.'
        : 'Ожидает оплаты. Билет выписывается после поступления средств.';

  switch (method) {
    case 'sberbank':
      return {
        bankLabel: 'Банк',
        bankName: 'ПАО Сбербанк / IATA BSP',
        accountName: payee,
        accountLabel: 'Счёт / Тел (СБП)',
        accountNumber: phone,
        referenceCode,
        paymentNotice: `Электронный билет оформлен по Резолюции IATA 722g. Форма оплаты: Сбербанк / СБП. ${statusNote} В назначении укажите код PNR.`,
      };
    case 'tinkoff':
      return {
        bankLabel: 'Банк',
        bankName: 'Т-Банк (Тинькофф) / IATA BSP',
        accountName: payee,
        accountLabel: 'Счёт / Тел (СБП)',
        accountNumber: phone,
        referenceCode,
        paymentNotice: `Электронный билет оформлен по Резолюции IATA 722g. Форма оплаты: Т-Банк (Тинькофф) / СБП. ${statusNote} В комментарии к переводу укажите код PNR.`,
      };
    case 'cash':
      return {
        bankLabel: 'Способ',
        bankName: 'Наличные в авиакассе Micor',
        accountName: payee,
        accountLabel: 'Место оплаты',
        accountNumber: MICOR_TRAVELS_INFO.address,
        referenceCode,
        paymentNotice: `Электронный билет оформлен по Резолюции IATA 722g. Форма оплаты: наличные в кассе агентства. ${statusNote}`,
      };
    case 'ecocash':
      return {
        bankLabel: 'Сервис',
        bankName: 'EcoCash / Zimbabwe Mobile Money',
        accountName: payee,
        accountLabel: 'Кошелёк / Тел',
        accountNumber: MICOR_TRAVELS_INFO.whatsapp,
        referenceCode,
        paymentNotice: `Электронный билет оформлен по Резолюции IATA 722g. Форма оплаты: EcoCash. ${statusNote} В примечании укажите код PNR.`,
      };
    case 'wire_transfer':
      return {
        bankLabel: 'Банк',
        bankName: 'Банковский перевод / IATA BSP Billing',
        accountName: payee,
        accountLabel: 'Реквизиты',
        accountNumber: `${phone} • ${MICOR_TRAVELS_INFO.iata}`,
        referenceCode,
        paymentNotice: `Электронный билет оформлен по Резолюции IATA 722g. Форма оплаты: безналичный / университетский перевод. ${statusNote} В назначении платежа укажите код PNR.`,
      };
    case 'bank_card':
    default:
      return {
        bankLabel: 'Способ',
        bankName: 'Банковская карта / IATA BSP',
        accountName: payee,
        accountLabel: 'Касса / терминал',
        accountNumber: 'Оплата картой в авиакассе или онлайн',
        referenceCode,
        paymentNotice: `Электронный билет оформлен по Резолюции IATA 722g. Форма оплаты: банковская карта (безналичный расчёт). ${statusNote}`,
      };
  }
}
