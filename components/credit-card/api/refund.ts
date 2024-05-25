import axios from "axios";
import { storeDataStore } from "../../../stores/store";
type TPayload = {
    TerminalNumber: string;
    Password: string;
    TransactionIdToCancelOrRefund: string,
    TransactionSum: number,
}


const refundTransaction = ({TransactionIdToCancelOrRefund, TransactionSum}:any) => {
    const paymentCredentials = storeDataStore.paymentCredentials;
    let body: TPayload = {
        TerminalNumber: paymentCredentials.credentials_terminal_number,
        Password: paymentCredentials.credentials_password,
        TransactionIdToCancelOrRefund,
        TransactionSum,
    };
    console.log("refundTransactionbody",body)
    return axios
        .post(
            'https://pci.zcredit.co.il/ZCreditWS/api/Transaction/RefundTransaction',
            body,
        )
        .then(function (res: any) {
            console.log("refundRes", res)
            return res;
        });
}

export default refundTransaction;