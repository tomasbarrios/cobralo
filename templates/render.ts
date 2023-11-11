import { Eta } from "eta";
import path from "path";

export function render({ template, data }: { template: string, data: {} }) {
  const eta = new Eta({ views: path.join(__dirname, "templates") });

  // Render a template

  const res = eta.render("./" + template, data);
  console.log(res); // Hi Ben!
  return res;
}

export function renderTemplateForRemix({ templateString, data }: { templateString: string, data: {} }) {
  const eta = new Eta();

  // Render a template

  const res = eta.renderString(templateString, data);
  return res
}

export const paymentDueTemplate = `Estimado <%= it.receiverName %>,


  Queremos recordarte que hemos emitido la factura <%= it.invoiceNumber %>, correspondiente a "<%= it.invoiceDescription %>" 
  
  Puedes ver el documento en el siguiente link 
  <%= it.invoiceLink %>
  
  
  Fecha Emisión: <%= it.invoiceDate %>
  
  Monto: <%= it.invoiceAmount %>
  
  
  Muchas gracias por preferirnos.
  
  
  Puedes realizar el pago en la siguiente cuenta
  
  <%= it.paymentAccountDetails %>
  
  --------------------
  <%= it.senderName %>
  
  <%= it.senderSignature %>`;
