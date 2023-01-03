# MGMT-NG

## Users
    * Can use same user login system as mgmt. Sign up is very basic, u/p. 
    * Do not need the whole application process that mgmt had. 
    * Users will be able to configure their default payment addresses in their settings. Can support BTC, LTC, DCR to start. 

## Payment Requests (invoice)
    * Payment requests can be sent to ANY user.
    * Payment request feature would be more basic than mgmt. This would be a more generic type of invoice. Lets look at standard invoice templates as a model for this. Should allow for a very simple payment request, or for it to be more professional. This should be very simple to begin with.
      * Date, From, To, Line Items (date,description, hours, amount), total, payment options and addresses.
    * All final details will be saved in invoice data so that it is immutable. (such as if a user later modifies their default payment addresses)
    * Users can still edit payment requests that have not been payed. Maintain version history of edited payment requests?
    * Payment requests that the receiver has marked as paid can not be edited.
    * All users will have a view to see all incoming payment requests for them to pay. 
    * Users submit a payment txid when marking a payment request as payed.

## Payment Reminders (iou)
    * Payment reminder, this is a reverse payment request. A user can create it as a reminder that they need to pay someone else, and send it to someone else. Could be sent as an email or phone number to someone who does not have an account yet.
    * This would alow show up in the appropriate incoming and outgoing queues for the users. Doesnt need its own queue, would be the same view as payment requests.
    * Also can be a draft.

## General features
    * Payments can be saved as Draft. Would still be viewable to both parties, but not possible to pay it yet.
    * Ability to invoice in USD or local currency, and have exchange rate to a cryptocurrency automatically calculated, like mgmt does.
    * Timer feature from mgmt for individual line items added in draft?

## Other Big Items
    * Privacy infrastructre like protons
    * Store fronts
    * Passkeys for login
    * Support non cryptos for payment? Cash, Gold, Paypal, CashApp, Venmo.
    * Bulk payment feature like mgmt.
    * Ability to assign other users to approve invoice line items for invoices from other specific users, like mgmt. 
