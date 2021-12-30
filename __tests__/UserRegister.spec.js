const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};

const postUser = (user = validUser) => {
  return request(app).post('/api/1.0/users').send(user);
};

describe('User Registration', () => {
  it('Returns 200 when the input is valid.', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('Returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('User created');
  });

  it('save the user to the database', async () => {
    await postUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('save username and email to database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@mail.com');
  });

  it('hashes the password in database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe('P4ssword');
  });

  //Testing for invalid input
  it('returns 400 when the user name is null', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });
    expect(response.status).toBe(400);
  });

  //Validation error
  it('returns validationErrors field in response body when varificaiton error occurs', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  //when both username and email fields are null
  it('Returns error when both email and username fields are null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: 'P4ssword',
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  it.each`
    field         | value                   | expectedMessage
    ${'username'} | ${null}                 | ${'Username cannot be null'}
    ${'username'} | ${'usr'}                | ${'Must have min 4 and max 20 characters'}
    ${'username'} | ${'a'.repeat(33)}       | ${'Must have min 4 and max 20 characters'}
    ${'email'}    | ${null}                 | ${'Email cannot be null'}
    ${'email'}    | ${'mail.com'}           | ${'Email is not valid'}
    ${'email'}    | ${'user1.mail.com'}     | ${'Email is not valid'}
    ${'email'}    | ${'user1@mail'}         | ${'Email is not valid'}
    ${'password'} | ${null}                 | ${'Password cannot be null'}
    ${'password'} | ${'P'.repeat(3)}        | ${'Password must be at least 6 characters long'}
    ${'password'} | ${'alllowercase'}       | ${'Password must contain at least 1 upper case, 1 lower case and 1 number'}
    ${'password'} | ${'ALLUPPERCASE'}       | ${'Password must contain at least 1 upper case, 1 lower case and 1 number'}
    ${'password'} | ${'1234567890'}         | ${'Password must contain at least 1 upper case, 1 lower case and 1 number'}
    ${'password'} | ${'lowerandUPPER'}      | ${'Password must contain at least 1 upper case, 1 lower case and 1 number'}
    ${'password'} | ${'lowerand1234567890'} | ${'Password must contain at least 1 upper case, 1 lower case and 1 number'}
    ${'password'} | ${'UPPERAND1234567890'} | ${'Password must contain at least 1 upper case, 1 lower case and 1 number'}
  `(
    'returns $expectedMessage when $field is $value',
    async ({ field, expectedMessage, value }) => {
      const user = {
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword',
      };
      user[field] = value;
      const response = await postUser(user);
      const body = response.body;
      expect(body.validationErrors[field]).toBe(expectedMessage);
    }
  );
});
