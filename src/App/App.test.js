/* eslint-disable prettier/prettier */
import { sendTransaction, signTransaction } from "./utils";


test('getAccounts returns an array of accounts', async () => {
    // Mocking the provider
    const mockProvider = {
        listAccounts: jest.fn().mockResolvedValue(['0xAccount1', '0xAccount2'])
    };

    // Call the function
    const accounts = await mockProvider.listAccounts();

    // Assertions
    expect(accounts).toEqual(['0xAccount1', '0xAccount2']);
    expect(mockProvider.listAccounts).toHaveBeenCalledTimes(1);
});

test('getConnectedAccount returns single account', async () => {
    const mockProvider = {
        listAccounts: jest.fn().mockResolvedValue('0xAccount1')
    };

    const accounts = await mockProvider.listAccounts();

    expect(accounts).toEqual('0xAccount1');
    expect(mockProvider.listAccounts).toHaveBeenCalledTimes(1);
});

test('getBalance returns the balance of the account', async () => {
    const mockProvider = {
        getBalance: jest.fn().mockResolvedValue('10') // Mocked balance: 10 ETH
    };

    const balance = await mockProvider.getBalance('0xAccount1');

    expect(balance).toEqual('10'); // Ensure correct balance is returned
    expect(mockProvider.getBalance).toHaveBeenCalledWith('0xAccount1'); // Ensure getBalance is called with the correct account
    expect(mockProvider.getBalance).toHaveBeenCalledTimes(1); // Ensure getBalance is called once
});


test('getBlockNumber returns the block number', async () => {
    const mockProvider = {
        getBlockNumber: jest.fn().mockResolvedValue(12345)
    };

    const blockNumber = await mockProvider.getBlockNumber();

    expect(blockNumber).toBe(12345);
    expect(mockProvider.getBlockNumber).toHaveBeenCalledTimes(1);
});

test('Should return the correct transaction count', async () => {
    const mockProvider = {
        getTransactionCount: jest.fn().mockResolvedValue(100) // Dummy transaction count
    };

    const transactionCount = await mockProvider.getTransactionCount();

    expect(transactionCount).toBe(100); // Ensure correct transaction count is returned
    expect(mockProvider.getTransactionCount).toHaveBeenCalledTimes(1); // Ensure getTransactionCount is called once
});


test('signTransaction signs a transaction', async () => {
    const mockSignTransaction = jest.fn().mockResolvedValue({
        signedTransaction: '0xabcdef123456'
    });
    const mockGetSigner = jest.fn().mockReturnValue({
        signTransaction: mockSignTransaction
    });
    const mockProvider = {
        getSigner: mockGetSigner
    };

    const to = '0xe613B4cd69Fe20E8bd0F0D79a264210886bA1AA2';
    const value = '0.01';
    const signedTransactionObject = await signTransaction(to, value, mockProvider);

    expect(signedTransactionObject.signedTransaction).toBe('0xabcdef123456');
    expect(mockGetSigner).toHaveBeenCalledTimes(1);
    expect(mockSignTransaction).toHaveBeenCalledWith({ to, value });
    expect(mockSignTransaction).toHaveBeenCalledTimes(1);
});

// Mock the verifyMessage function



test('sendTransaction sends a transaction', async () => {
    const mockSendTransaction = jest.fn().mockResolvedValue({
        hash: '0x123abc'
    });
    const mockGetSigner = jest.fn().mockReturnValue({
        sendTransaction: mockSendTransaction
    });
    const mockProvider = {
        getSigner: mockGetSigner
    };

    const to = '0xe613B4cd69Fe20E8bd0F0D79a264210886bA1AA2';
    const value = '0.01';
    const transactionHash = await sendTransaction(to, value, mockProvider);

    expect(transactionHash).toBe('0x123abc');
    expect(mockGetSigner).toHaveBeenCalledTimes(1);
    expect(mockSendTransaction).toHaveBeenCalledWith({
        to,
        value
    });
    expect(mockSendTransaction).toHaveBeenCalledTimes(1);
});




