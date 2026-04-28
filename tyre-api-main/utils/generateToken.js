import jwt from 'jsonwebtoken';

const generateToken = (id, limited_time) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: limited_time ? '1d' : '30d',
  });
};

export default generateToken;
