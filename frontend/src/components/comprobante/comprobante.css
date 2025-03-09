import React, { useEffect, useState } from "react";
import axios from "axios";

const Comprobante = () => {
    const [transactionId, setTransactionId] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configuración de las APIs
    const API_REQUEST = "https://apis-merchant.qa.deunalab.com/merchant/v1/payment/request";
    const API_INFO = "https://apis-merchant.qa.deunalab.com/merchant/v1/payment/info";

    // Datos para la solicitud de pago
    const requestData = {
        pointOfSale: "4121565",
        qrType: "dynamic",
        amount: 5.19,
        detail: "test postman GEO",
        internalTransactionReference: "IXWAHROMYSCEZWQ",
        format: "2",
    };

    // Función para obtener el transactionId
    const fetchTransactionId = async () => {
        try {
            const response = await axios.post(API_REQUEST, requestData);
            if (response.data && response.data.transactionId) {
                setTransactionId(response.data.transactionId);
            } else {
                throw new Error("No se recibió transactionId");
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Función para obtener la información del pago
    const fetchPaymentInfo = async (id) => {
        try {
            const response = await axios.post(API_INFO, {
                idTransacionReference: id,
                idType: "0",
            });
            setPaymentInfo(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchTransactionId();
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (transactionId) {
            fetchPaymentInfo(transactionId);
        }
    }, [transactionId]);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Comprobante de Pago</h2>
            {transactionId && <p><strong>Transaction ID:</strong> {transactionId}</p>}
            {paymentInfo ? (
                <div>
                    <p><strong>Estado:</strong> {paymentInfo.status}</p>
                    <p><strong>Monto:</strong> {paymentInfo.amount} {paymentInfo.currency}</p>
                    <p><strong>Fecha:</strong> {paymentInfo.date || "N/A"}</p>
                    <p><strong>Descripción:</strong> {paymentInfo.description || "Sin descripción"}</p>
                    <p><strong>Ordenante:</strong> {paymentInfo.ordererName || "Desconocido"}</p>
                </div>
            ) : (
                <p>No se encontró información de pago.</p>
            )}
        </div>
    );
};

export default Comprobante;
