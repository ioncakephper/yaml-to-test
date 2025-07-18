const path = require('path');
const fs = require('fs');
const { Command } = require('commander');
const { loadPackage, createProgram } = require('../../src/utils/createProgram');

jest.mock('fs');

jest.mock('commander', () => {
  const mCommand = jest.fn().mockImplementation(() => ({
    name: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    option: jest.fn().mockReturnThis(),
    configureHelp: jest.fn().mockReturnThis(),
  }));
  return { Command: mCommand };
});

describe('loadPackage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('test_loads_valid_package_json', () => {
    const fakeJson = '{"name":"my-app","version":"1.0.0"}';
    fs.readFileSync.mockReturnValue(fakeJson);
    const result = loadPackage();
    expect(result).toEqual({ name: 'my-app', version: '1.0.0' });
    expect(fs.readFileSync).toHaveBeenCalled();
  });

  it('test_returns_expected_properties', () => {
    const fakeJson = '{"name":"test-app","version":"2.0.0","dependencies":{"jest":"^27.0.0"}}';
    fs.readFileSync.mockReturnValue(fakeJson);
    const result = loadPackage();
    expect(result).toHaveProperty('name', 'test-app');
    expect(result).toHaveProperty('version', '2.0.0');
    expect(result).toHaveProperty('dependencies');
    expect(result.dependencies).toHaveProperty('jest', '^27.0.0');
  });

  it('test_reads_with_utf8_encoding', () => {
    const fakeJson = '{"name":"utf8-app"}';
    fs.readFileSync.mockReturnValue(fakeJson);
    loadPackage();
    const expectedPath = path.resolve(__dirname, '../../package.json');
    expect(fs.readFileSync).toHaveBeenCalledWith(expectedPath, 'utf8');
  });

  it('test_file_not_found_error', () => {
    fs.readFileSync.mockImplementation(() => {
      const err = new Error('ENOENT: no such file or directory');
      err.code = 'ENOENT';
      throw err;
    });
    expect(() => loadPackage()).toThrow(/ENOENT/);
  });

  it('test_invalid_json_error', () => {
    fs.readFileSync.mockReturnValue('invalid json');
    expect(() => loadPackage()).toThrow(SyntaxError);
  });

  it('test_permission_denied_error', () => {
    fs.readFileSync.mockImplementation(() => {
      const err = new Error('EACCES: permission denied');
      err.code = 'EACCES';
      throw err;
    });
    expect(() => loadPackage()).toThrow(/EACCES/);
  });
});

describe('createProgram', () => {
  let originalLoadPackage;
  let mockCommandInstance;

  beforeEach(() => {
    jest.resetModules();
    mockCommandInstance = {
      name: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      version: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      configureHelp: jest.fn().mockReturnThis(),
    };
    require('commander').Command.mockImplementation(() => mockCommandInstance);
    originalLoadPackage = require('../../src/utils/createProgram').loadPackage;
  });

  afterEach(() => {
    require('commander').Command.mockClear();
    if (originalLoadPackage) {
      require('../../src/utils/createProgram').loadPackage = originalLoadPackage;
    }
  });

  it('test_defaults_when_fields_missing', () => {
    require('../../src/utils/createProgram').loadPackage = jest.fn(() => ({}));
    createProgram();
    expect(mockCommandInstance.name).toHaveBeenCalledWith('cli-tool');
    expect(mockCommandInstance.description).toHaveBeenCalledWith('A CLI tool for various tasks');
    expect(mockCommandInstance.version).toHaveBeenCalledWith('1.0.0');
  });

  it('test_registers_cli_options_and_help', () => {
    require('../../src/utils/createProgram').loadPackage = jest.fn(() => ({}));
    createProgram();
    expect(mockCommandInstance.option).toHaveBeenCalledWith('-v, --verbose', expect.any(String));
    expect(mockCommandInstance.option).toHaveBeenCalledWith('--debug', expect.any(String));
    expect(mockCommandInstance.option).toHaveBeenCalledWith('--quiet', expect.any(String));
    expect(mockCommandInstance.configureHelp).toHaveBeenCalledWith({
      sortOptions: true,
      showGlobalOptions: true,
    });
  });

  it('test_returns_configured_command', () => {
    require('../../src/utils/createProgram').loadPackage = jest.fn(() => ({}));
    const program = createProgram();
    expect(program).toBe(mockCommandInstance);
  });

  it('test_non_string_fields', () => {
    require('../../src/utils/createProgram').loadPackage = jest.fn(() => ({
      name: 123,
      version: {},
      description: [],
    }));
    createProgram();
    expect(mockCommandInstance.name).toHaveBeenCalledWith('cli-tool');
    expect(mockCommandInstance.description).toHaveBeenCalledWith('A CLI tool for various tasks');
    expect(mockCommandInstance.version).toHaveBeenCalledWith('1.0.0');
  });

  it('test_load_package_returns_null', () => {
    require('../../src/utils/createProgram').loadPackage = jest.fn(() => null);
    createProgram();
    expect(mockCommandInstance.name).toHaveBeenCalledWith('cli-tool');
    expect(mockCommandInstance.description).toHaveBeenCalledWith('A CLI tool for various tasks');
    expect(mockCommandInstance.version).toHaveBeenCalledWith('1.0.0');
  });

  it('test_command_constructor_error', () => {
    require('commander').Command.mockImplementation(() => { throw new Error('Constructor failed'); });
    require('../../src/utils/createProgram').loadPackage = jest.fn(() => ({}));
    expect(() => createProgram()).toThrow('Constructor failed');
  });

  it('test_applies_valid_package_fields', () => {
    const pkg = {
      name: 'my-cli',
      version: '2.3.4',
      description: 'A custom CLI tool',
    };
    require('../../src/utils/createProgram').loadPackage = jest.fn(() => pkg);
    createProgram();
    expect(mockCommandInstance.name).toHaveBeenCalledWith('my-cli');
    expect(mockCommandInstance.description).toHaveBeenCalledWith('A custom CLI tool');
    expect(mockCommandInstance.version).toHaveBeenCalledWith('2.3.4');
  });

  it('test_load_package_throws_error', () => {
    require('../../src/utils/createProgram').loadPackage = jest.fn(() => { throw new Error('Unexpected error'); });
    expect(() => createProgram()).toThrow('Unexpected error');
  });
});