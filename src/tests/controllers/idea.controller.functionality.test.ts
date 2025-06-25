import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { addFunctionality, updateFunctionality, removeFunctionality } from '../../controllers/idea.controller';
import prisma from '../../lib/prisma';

describe('addFunctionality', () => {
  it('should_execute_successfully_with_valid_input', async () => {
    const req = {
      body: {
        ideaId: 1,
        title: 'New Feature',
        description: 'Add a new feature',
        additionalInfo: 'Some info'
      }
    } as Request;

    const expectedFunc = {
      id: 123,
      ideaId: 1,
      title: 'New Feature',
      description: 'Add a new feature',
      additionalInfo: 'Some info'
    };

    // @ts-ignore
    prisma.functionality = {
      create: async ({ data }: any) => ({
        ...expectedFunc,
        ...data
      })
    };

    let jsonResult: any;
    const res = {
      json: (result: any) => {
        jsonResult = result;
      }
    } as unknown as Response;

    await addFunctionality(req, res);
    expect(jsonResult).toMatchObject(expectedFunc);
  });

  it('should_return_expected_output_type_for_standard_input', async () => {
    const req = {
      body: {
        ideaId: 2,
        title: 'Another Feature',
        description: 'Description here',
        additionalInfo: 'Extra'
      }
    } as Request;

    const expectedFunc = {
      id: 456,
      ideaId: 2,
      title: 'Another Feature',
      description: 'Description here',
      additionalInfo: 'Extra'
    };

    // @ts-ignore
    prisma.functionality = {
      create: async ({ data }: any) => ({
        ...expectedFunc,
        ...data
      })
    };

    let jsonResult: any;
    const res = {
      json: (result: any) => {
        jsonResult = result;
      }
    } as unknown as Response;

    await addFunctionality(req, res);
    expect(typeof jsonResult).toBe('object');
    expect(jsonResult).toHaveProperty('ideaId', 2);
    expect(jsonResult).toHaveProperty('title', 'Another Feature');
  });

  it('should_handle_multiple_valid_input_scenarios', async () => {
    const scenarios = [
      {
        body: {
          ideaId: 3,
          title: 'Feature A',
          description: 'Desc A',
          additionalInfo: 'Info A'
        },
        expected: {
          id: 789,
          ideaId: 3,
          title: 'Feature A',
          description: 'Desc A',
          additionalInfo: 'Info A'
        }
      },
      {
        body: {
          ideaId: 4,
          title: 'Feature B',
          description: 'Desc B',
          additionalInfo: ''
        },
        expected: {
          id: 790,
          ideaId: 4,
          title: 'Feature B',
          description: 'Desc B',
          additionalInfo: ''
        }
      }
    ];

    let callCount = 0;
    // @ts-ignore
    prisma.functionality = {
      create: async ({ data }: any) => ({
        ...scenarios[callCount].expected,
        ...data
      })
    };

    for (const scenario of scenarios) {
      let jsonResult: any;
      const req = { body: scenario.body } as Request;
      const res = {
        json: (result: any) => {
          jsonResult = result;
        }
      } as unknown as Response;

      await addFunctionality(req, res);
      expect(jsonResult).toMatchObject(scenario.expected);
      callCount++;
    }
  });

  it('should_throw_error_when_required_input_missing', async () => {
    const req = {
      body: {
        // missing ideaId, title, description, additionalInfo
      }
    } as Request;

    // @ts-ignore
    prisma.functionality = {
      create: async () => {
        throw new Error('Missing required fields');
      }
    };

    const res = {
      json: () => {}
    } as unknown as Response;

    await expect(addFunctionality(req, res)).rejects.toThrow('Missing required fields');
  });

  it('should_return_default_for_empty_input', async () => {
    const req = {
      body: {}
    } as Request;

    // @ts-ignore
    prisma.functionality = {
      create: async ({ data }: any) => ({
        id: 999,
        ideaId: data.ideaId ?? null,
        title: data.title ?? '',
        description: data.description ?? '',
        additionalInfo: data.additionalInfo ?? ''
      })
    };

    let jsonResult: any;
    const res = {
      json: (result: any) => {
        jsonResult = result;
      }
    } as unknown as Response;

    await addFunctionality(req, res);
    expect(jsonResult).toMatchObject({
      id: 999,
      ideaId: null,
      title: '',
      description: '',
      additionalInfo: ''
    });
  });

  it('should_handle_unexpected_input_types_gracefully', async () => {
    const req = {
      body: {
        ideaId: 'not-a-number',
        title: 12345,
        description: {},
        additionalInfo: []
      }
    } as Request;

    // @ts-ignore
    prisma.functionality = {
      create: async ({ data }: any) => ({
        id: 1000,
        ...data
      })
    };

    let jsonResult: any;
    const res = {
      json: (result: any) => {
        jsonResult = result;
      }
    } as unknown as Response;

    await addFunctionality(req, res);
    expect(jsonResult).toMatchObject({
      id: 1000,
      ideaId: 'not-a-number',
      title: 12345,
      description: {},
      additionalInfo: []
    });
  });
});