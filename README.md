# MGMT Next Gen App Spec

## Prerequisites
    * Remove all unused functionality from existing code base.
    * Possibly start on a fresh repo, using mgmt as a reference.


## Main Features
### Service Work
    Allow invoicing from and to any user:
        * Every user has an incoming payment request view.
        * Modify Worklog functionality to allow submission to any user.
        * Keep existing non-custodial model: this will only track addressing
        * Could verify payment/invoice status on blockchain by using txid submitted by payor.
        * Allows users to set payment addreses for multiple coin types.

    Reverse payment request:
        * Owed money could be sent in an IOU form with an amount and description, which could be fulfilled once the address is populated. 
    
    
### Product catalog
        * Store front for selling products using the same payment request system.
        * Payment tracking via txid.

    

### Privacy Controls
        * Investigate proton's architecture.
