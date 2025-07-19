const buildCommand = require('./build');

// src/commands/build.test.js

describe('build command', () => {
    let mockProgram;
    let mockCommand;
    let mockDescription;
    let mockOption;
    let mockAction;

    beforeEach(() => {
        mockDescription = jest.fn().mockReturnThis();
        mockOption = jest.fn().mockReturnThis();
        mockAction = jest.fn().mockReturnThis();
        mockCommand = jest.fn(() => ({
            description: mockDescription,
            option: mockOption,
            action: mockAction,
        }));
        mockProgram = {
            command: mockCommand,
        };
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it('registers build command with correct name and description', () => {
        buildCommand(mockProgram);
        expect(mockCommand).toHaveBeenCalledWith('build');
        expect(mockDescription).toHaveBeenCalledWith('Build the project');
    });

    it('registers config option with correct flags, description, and default', () => {
        buildCommand(mockProgram);
        expect(mockOption).toHaveBeenCalledWith(
            '-c, --config <path>',
            'Path to the configuration file',
            'config.json'
        );
    });

    it('registers an action handler', () => {
        buildCommand(mockProgram);
        expect(mockAction).toHaveBeenCalledWith(expect.any(Function));
    });

    it('action handler logs correct message with provided config path', () => {
        buildCommand(mockProgram);
        // Get the action handler function
        const actionHandler = mockAction.mock.calls[0][0];
        actionHandler({ config: 'custom.json' });
        expect(console.log).toHaveBeenCalledWith(
            'Building project with configuration from: custom.json'
        );
    });

    it('action handler logs correct message with default config path', () => {
        buildCommand(mockProgram);
        const actionHandler = mockAction.mock.calls[0][0];
        actionHandler({ config: undefined });
        expect(console.log).toHaveBeenCalledWith(
            'Building project with configuration from: undefined'
        );
    });
});