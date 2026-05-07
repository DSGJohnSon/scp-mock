import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { AdminNewOrderEmail } from '@/emails/admin-new-order';
import { ResetPasswordEmail } from '@/emails/reset-password';
import { StageReminderEmail } from '@/emails/stage-reminder';

export const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder');

interface OrderEmailData {
  orderNumber: string;
  orderDate: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderItems: any[];
  depositTotal: number;
  remainingTotal: number;
  totalAmount: number;
  discountAmount?: number;
  promoDiscountAmount?: number;
  promoCode?: string | null;
  futurePayments: Array<{
    amount: number;
    date: string;
    description: string;
    participantName: string;
  }>;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const sender = process.env.RESEND_FROM_EMAIL || 'Serre Chevalier Parapente <noreply@serre-chevalier-parapente.fr>';

    const { data: emailData, error } = await resend.emails.send({
      from: sender,
      to: [data.customerEmail],
      subject: `Confirmation de réservation - Commande ${data.orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber: data.orderNumber,
        orderDate: data.orderDate,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        orderItems: data.orderItems,
        depositTotal: data.depositTotal,
        remainingTotal: data.remainingTotal,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount || 0,
        futurePayments: data.futurePayments,
      }),
    });

    if (error) {
      throw error;
    }
    return { success: true, emailId: emailData?.id };
  } catch (error) {
    throw error;
  }
}

export async function sendAdminNewOrderEmail(data: OrderEmailData) {
  try {
    const sender = process.env.RESEND_FROM_EMAIL || 'Serre Chevalier Parapente <noreply@serre-chevalier-parapente.fr>';
    const adminEmail = process.env.ADMIN_EMAIL || '';

    const { data: emailData, error } = await resend.emails.send({
      from: sender,
      to: [adminEmail],
      subject: `Nouvelle commande reçue ! - ${data.orderNumber}`,
      react: AdminNewOrderEmail({
        orderNumber: data.orderNumber,
        orderDate: data.orderDate,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        orderItems: data.orderItems,
        depositTotal: data.depositTotal,
        remainingTotal: data.remainingTotal,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount || 0,
        promoDiscountAmount: data.promoDiscountAmount || 0,
        promoCode: data.promoCode ?? undefined,
      }),
    });

    if (error) {
      throw error;
    }
    return { success: true, emailId: emailData?.id };
  } catch (error) {
    throw error;
  }
}


export async function sendPasswordResetEmail({
  userName,
  userEmail,
  resetUrl,
}: {
  userName: string;
  userEmail: string;
  resetUrl: string;
}) {
  const sender = process.env.RESEND_FROM_EMAIL || 'Serre Chevalier Parapente <noreply@serre-chevalier-parapente.fr>';
  const { error } = await resend.emails.send({
    from: sender,
    to: [userEmail],
    subject: 'Réinitialisation de votre mot de passe',
    react: ResetPasswordEmail({ userName, resetUrl }),
  });
  if (error) throw error;
}

interface StageReminderData {
  firstName: string;
  lastName: string;
  email: string;
  stageType: string;
  startDate: string;
  daysUntilStart: 1 | 7;
  bookingShortCode?: string | null;
  remainingAmount?: number;
}

export async function sendStageReminderEmail(data: StageReminderData) {
  const sender = process.env.RESEND_FROM_EMAIL || 'Serre Chevalier Parapente <noreply@serre-chevalier-parapente.fr>';
  const subject = data.daysUntilStart === 1
    ? `Votre stage commence demain — ${new Date(data.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
    : `Votre stage commence dans 7 jours — ${new Date(data.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;

  const { error } = await resend.emails.send({
    from: sender,
    to: [data.email],
    subject,
    react: StageReminderEmail({
      firstName: data.firstName,
      lastName: data.lastName,
      stageType: data.stageType,
      startDate: data.startDate,
      daysUntilStart: data.daysUntilStart,
      bookingShortCode: data.bookingShortCode,
      remainingAmount: data.remainingAmount,
    }),
  });

  if (error) throw error;
  return { success: true };
}

