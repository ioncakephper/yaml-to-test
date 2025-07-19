const path = require('path');
const { loadCommands } = require('./loadCommands');
const fs = require('fs');

jest.mock('fs');
jest.mock('commander', () => ({ program: {} }));

describe('loadCommands', () => {
    const mockProgram = {};

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    it('should load and execute command modules from a directory', () => {
        const commandsDir = '/fake/commands';
        const files = ['cmd1.js', 'cmd2.js'];
        fs.readdirSync.mockReturnValue(files);

        // Mock statSync to return file for both
        fs.statSync.mockImplementation((filePath) => ({
            isDirectory: () => false
        }));

        // Mock require for command modules
        const cmd1 = jest.fn();
        const cmd2 = jest.fn();
        jest.mock(path.join(commandsDir, 'cmd1.js'), () => cmd1, { virtual: true });
        jest.mock(path.join(commandsDir, 'cmd2.js'), () => cmd2, { virtual: true });

        // Patch require to use our mocks
        const originalRequire = module.require;
        module.require = (filePath) => {
            if (filePath.endsWith('cmd1.js')) return cmd1;
            if (filePath.endsWith('cmd2.js')) return cmd2;
            return originalRequire.call(module, filePath);
        };

        loadCommands(mockProgram, commandsDir);

        expect(cmd1).toHaveBeenCalledWith(mockProgram);
        expect(cmd2).toHaveBeenCalledWith(mockProgram);

        module.require = originalRequire;
    });

    it('should recursively load commands from subdirectories', () => {
        const commandsDir = '/fake/commands';
        const files = ['subdir', 'cmd.js'];
        fs.readdirSync.mockImplementation((dir) => {
            if (dir === commandsDir) return files;
            if (dir === path.join(commandsDir, 'subdir')) return ['subcmd.js'];
            return [];
        });

        fs.statSync.mockImplementation((filePath) => ({
            isDirectory: () => filePath.endsWith('subdir')
        }));

        const cmd = jest.fn();
        const subcmd = jest.fn();
        jest.mock(path.join(commandsDir, 'cmd.js'), () => cmd, { virtual: true });
        jest.mock(path.join(commandsDir, 'subdir', 'subcmd.js'), () => subcmd, { virtual: true });

        const originalRequire = module.require;
        module.require = (filePath) => {
            if (filePath.endsWith('cmd.js')) return cmd;
            if (filePath.endsWith('subcmd.js')) return subcmd;
            return originalRequire.call(module, filePath);
        };

        loadCommands(mockProgram, commandsDir);

        expect(cmd).toHaveBeenCalledWith(mockProgram);
        expect(subcmd).toHaveBeenCalledWith(mockProgram);

        module.require = originalRequire;
    });

    it('should skip non-function command modules and warn', () => {
        const commandsDir = '/fake/commands';
        const files = ['notAFunction.js'];
        fs.readdirSync.mockReturnValue(files);
        fs.statSync.mockReturnValue({ isDirectory: () => false });

        const notAFunction = {};
        jest.mock(path.join(commandsDir, 'notAFunction.js'), () => notAFunction, { virtual: true });

        const originalRequire = module.require;
        module.require = (filePath) => {
            if (filePath.endsWith('notAFunction.js')) return notAFunction;
            return originalRequire.call(module, filePath);
        };

        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        loadCommands(mockProgram, commandsDir);

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping'));
        warnSpy.mockRestore();
        module.require = originalRequire;
    });

    it('should ignore non-js files', () => {
        const commandsDir = '/fake/commands';
        const files = ['file.txt', 'cmd.js'];
        fs.readdirSync.mockReturnValue(files);
        fs.statSync.mockImplementation((filePath) => ({
            isDirectory: () => false
        }));

        const cmd = jest.fn();
        jest.mock(path.join(commandsDir, 'cmd.js'), () => cmd, { virtual: true });

        const originalRequire = module.require;
        module.require = (filePath) => {
            if (filePath.endsWith('cmd.js')) return cmd;
            return originalRequire.call(module, filePath);
        };

        loadCommands(mockProgram, commandsDir);

        expect(cmd).toHaveBeenCalledWith(mockProgram);

        module.require = originalRequire;
    });
});