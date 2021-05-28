import React, { useReducer, useCallback, createContext, useEffect } from "react";

import { Web3Reducer } from "./reducer";

// WEB3 CONNECTION PACKAGES
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";

import Signer from '../utils/abi/Signer.json';
import {CONTRACT_ADDRESS, CURRENT_NETWORK} from './constants';

let web3 = null;

const initialState = {
  loading: true,
  connected: false,
  account: null,
  contracts: {},
  networkId: null,
  chainId: null,
};

export const Web3Context = createContext(initialState);

export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(Web3Reducer, initialState);

  const setAccount = (account) => {
    dispatch({
      type: "SET_ACCOUNT",
      payload: account,
    });
  };

  const setNetworkId = (networkId) => {
    dispatch({
      type: "SET_NETWORK_ID",
      payload: networkId,
    });
  };

  const setContracts = (contracts) => {
    dispatch({
      type: "SET_CONTRACTS",
      payload: contracts,
    });
  };

  const logout = () => {
    setAccount(null);
    localStorage.setItem("defaultWallet", null);
  };

  const connectWeb3 = useCallback(async () => {
    // Web3 Modal
    let host;
    let network;
    if(CURRENT_NETWORK === 'Rinkeby'){
      host = "https://rinkeby.infura.io/v3/203d5c0b362148819014f26057fb0d90";
      network = "rinkeby";
    }else{
      host = "https://mainnet.infura.io/v3/203d5c0b362148819014f26057fb0d90";
      network = "mainnet";
    }

    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: "203d5c0b362148819014f26057fb0d90", // required
        },
      },
      torus: {
        package: Torus, // required
        options: {
          networkParams: {
            host, // optional
            networkId: 1, // optional
          },
          config: {
            buildEnv: "production", // optional
          },
        },
      },
      authereum: {
        package: Authereum,
      },
    };

    try {
      const web3Modal = new Web3Modal({
        network,
        cacheProvider: true, // optional
        providerOptions, // required
        theme: "light",
      });
      const provider = await web3Modal.connect();

      web3 = new Web3(provider);
      window.web3 = web3;

      const signer = new web3.eth.Contract(Signer.abi, CONTRACT_ADDRESS);
      setContracts({...state.contracts, signer});
      window.signer = signer;

      const networkId = await web3.givenProvider.networkVersion;
      setNetworkId(networkId);
      
      const acc = await web3.eth.getAccounts();
      setAccount(acc[0]);
      console.log("Connected Account: ", acc[0]);

    } catch (error) {
      console.log(error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWeb3Lite = useCallback(async () => {
    // Web3 Modal
    let host;
    if(CURRENT_NETWORK === 'Rinkeby'){
      host = "https://rinkeby.infura.io/v3/203d5c0b362148819014f26057fb0d90";
    }else{
      host = "https://mainnet.infura.io/v3/203d5c0b362148819014f26057fb0d90";
    }

    try {

      web3 = new Web3(host);
      window.web3 = web3;

      const signer = new web3.eth.Contract(Signer.abi, CONTRACT_ADDRESS);
      setContracts({...state.contracts, signer});
      window.signer = signer;
      const networkId = await web3.givenProvider.networkVersion;
      setNetworkId(networkId);

    } catch (error) {
      console.log(error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOwner = async () => {
    if(state.account){
      return await state.contracts.signer.methods.owner().call();
    }
  }

  const getInformation = async (hash) => {
    if(state.account){
      return await state.contracts.signer.methods.getInformation(hash).call();
    } 
  }

  const uploadFile = async (promotion, fileHash, validFrom, validTo) => {
    if(state.account){
      return await state.contracts.signer.methods.uploadFile(promotion, fileHash, validFrom, validTo).send();
    } 
  }

  const requestVerification = async (companyName) => {
    if(state.account){
      await state.contracts.signer.methods.requestVerification(companyName).send();
    } 
  }

  const doVerification = async (address) => {
    if(await isOwner() && state.account){
      await state.contracts.signer.methods.verify(address).send();
    } 
  }

  const undoVerification = async (address) => {
    if(await isOwner() && state.account){
      await state.contracts.signer.methods.unverify(address).send();
    } 
  }

  const getAllFiles = async () => {
    let allFiles = [];
    let allEvents = await contracts.signer.getPastEvents('createFile', {fromBlock: DEPLOY_BLOCK, toBlock: 'latest'})
    for (const event of allEvents) {
      let file = event.returnValues;
      if(file.validTo * 1000 >= Date.now()){
        
        if(CURRENT_NETWORK === 'BSC_Testnet'){
          file.blockInfo = "https://testnet.bscscan.com/tx/"+event.transactionHash;
        }
        if(CURRENT_NETWORK === 'BSC'){
          file.blockInfo = "https://bscscan.com/tx/"+event.transactionHash;
        }
        if(CURRENT_NETWORK === 'Rinkeby'){
          file.blockInfo = "https://rinkeby.etherscan.io//tx/"+event.transactionHash;
        }
        if(CURRENT_NETWORK === 'Mainnet'){
          file.blockInfo = "https://etherscan.io//tx/"+event.transactionHash;
        }

        file.ipfsFile = "https://ipfs.io/ipfs/"+file.fileHash;
        allFiles.push(file);
      }
    }
    return allFiles;
  }

  useEffect(() => {
    if(localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")){
      connectWeb3();
    }else{
      connectWeb3Lite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Web3Context.Provider
      value={{
        ...state,
        web3,
        connectWeb3,
        logout,
        isOwner,
        getInformation,
        uploadFile,
        requestVerification,
        doVerification,
        undoVerification,
        getAllFiles
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
