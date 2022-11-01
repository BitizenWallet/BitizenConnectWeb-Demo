import BitizenConnectProvider, { logoUri as BitizenLogo } from "@bitizenwallet/connector-web3-provider";
import { ethers } from "ethers";

const infuraId = '47e28e2b5fd04f5fae8752dd2f7f0c7c'
const chainNameMap = {
    1: "Mainnet",
    3: "Ropsten",
    4: "Rinkeby",
    5: "Goerli",
    42: "Kovan",
    56: "Binance Smart Chain",
    97: "Binance Smart Chain Testnet",
    137: "Polygon",
    80001: "Polygon Testnet",
    43114: "Avalanche",
    43113: "Avalanche Testnet",
    250: "Fantom",
    4002: "Fantom Testnet",
    128: "Heco",
    256: "Heco Testnet",
    1666600000: "Harmony",
    1666700000: "Harmony Testnet",
    100: "Gnosis",
    42161: "Arbitrum",
    421611: "Arbitrum Testnet",
};

let accounts;
let selectedAccount;
let ethersInstance;
let provider;

const disconnectBtn = document.getElementById('disconnectBtn')!;
const showInConnected = document.getElementById('showInConnected')!;
const hideInConnected = document.getElementById('hideInConnected')!;
const connectedChainName = document.getElementById('connectedChainName')!;
const accountsSelect = document.getElementById('accountsSelect')!;
const personalSignBtn = document.getElementById('personalSignBtn')!;
const sendTransactionBtn = document.getElementById('sendTransactionBtn')!;
const balance = document.getElementById('balance')!;

const bitizenLogo = document.getElementById('bitizenLogo')!;
const bitizenConnectBtn = document.getElementById('connectBtn')!;
const bitizenConnectBtnLoading = bitizenConnectBtn.getElementsByTagName('svg')[0];

const onBitizenConnectBtnClicked = async () => {
    if (!bitizenConnectBtnLoading.classList.contains('hidden')) {
        return
    }
    // bitizenConnectBtnLoading.classList.remove('hidden');
    await disconnect();
    try {
        provider = new BitizenConnectProvider({
            infuraId,
        });
        accounts = await provider.enable();
        ethersInstance = new ethers.providers.Web3Provider(provider);
        await connected()
    } catch (error) {
        console.error(error);
    } finally {
        // bitizenConnectBtnLoading.classList.add('hidden');
    }
}

const disconnect = async () => {
    try {
        provider.disconnect();
    } catch (error) {
        console.error(error);
    }

    selectedAccount = undefined;
    accounts = [];
    ethersInstance = undefined;

    showInConnected.classList.add('hidden');
    hideInConnected.classList.remove('hidden');
}

const connected = async () => {
    showInConnected.classList.remove('hidden');
    hideInConnected.classList.add('hidden');

    try {
        accountsSelect.innerHTML = '';
        selectedAccount = accounts[0];
        accounts.forEach(acc => {
            const option = document.createElement('option');
            option.value = acc;
            option.innerHTML = acc;
            option.selected = acc == selectedAccount;
            accountsSelect.appendChild(option);
        });
        onSelectedAccountChanged();
    } catch (error) {
        console.error(error);
    }

    try {
        connectedChainName.innerText = 'Loading...';
        const { chainId } = await ethersInstance.getNetwork()
        connectedChainName.innerText = chainNameMap[chainId] || 'Unknown';
    } catch (error) {
        console.error(error);
    }
}

const onSelectedAccountChanged = async () => {
    selectedAccount = (accountsSelect as any).value;
    balance.innerText = 'Loading...';
    try {
        const balanceWei = await ethersInstance.getBalance(selectedAccount);
        const balanceEth = ethers.utils.formatEther(balanceWei);
        balance.innerText = balanceEth;
    } catch (error) {
        console.error(error);
    }
}

const onPersonalSignBtnClicked = async () => {
    try {
        const message = 'Hello World';
        const signature = await provider.request({
            method: 'personal_sign',
            params: [message, selectedAccount],
        });
        alert('Signature: ' + signature);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

const onSendTransactionBtnClicked = async () => {
    try {
        const tx = {
            from: selectedAccount,
            to: '0x0000000000000000000000000000000000000000',
            value: '0x00',
        };
        const txHash = await provider.send('eth_sendTransaction', [tx]);
        alert('Transaction hash: ' + txHash);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

(async function () {
    bitizenLogo.setAttribute('src', BitizenLogo)
    bitizenConnectBtn.onclick = onBitizenConnectBtnClicked;
    disconnectBtn.onclick = disconnect;
    accountsSelect.onchange = onSelectedAccountChanged;
    personalSignBtn.onclick = onPersonalSignBtnClicked;
    sendTransactionBtn.onclick = onSendTransactionBtnClicked;
})()
