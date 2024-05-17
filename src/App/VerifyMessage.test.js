/* eslint-disable prettier/prettier */
import { verifyMessage } from "./utils";

// Mock the ethers library
jest.mock('ethers', () => ({
    utils: {
        hashMessage: jest.fn().mockReturnValue('hashedMessage'),
        recoverAddress: jest.fn().mockReturnValue('recoveredAddress')
    }
}));

test('verifyMessage correctly verifies a signed message', async () => {
    // Mock data
    const message = "message";
    const signature = 'mockedSignature';
    const address = "0xF77E360F58323aE1ad0eb71C3c12d01e86982aBd";

    const isValid = await verifyMessage(message, signature, address);

    expect(isValid).toBe(true);
});
