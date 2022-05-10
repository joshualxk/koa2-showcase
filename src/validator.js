class WrongSchemaError extends Error {
}

class Validator {
  constructor(schemaObj) {
    this.checkSchema(schemaObj);
    this.schema = schemaObj;
  }

  #isObj(obj) {
    return obj instanceof Object && !Array.isArray(obj);
  }

  #getOrDef(obj, key, val) {
    return obj.hasOwnProperty(key) ? obj[key] : val;
  }

  checkSchema(schemaObj) {
    if (this.#isObj(schemaObj)) {
      if (schemaObj.hasOwnProperty('type')) {
        switch (schemaObj['type']) {
          case 'string':
            if (schemaObj.hasOwnProperty('regex') && typeof schemaObj['regex'] !== 'string') {
              throw new WrongSchemaError('field attr (regex) expect string!');
            }
          // fallthrough
          case 'int':
            if (schemaObj.hasOwnProperty('min') && !Number.isInteger(schemaObj['min'])) {
              throw new WrongSchemaError('field attr (min) expect integer!');
            }
            if (schemaObj.hasOwnProperty('max') && !Number.isInteger(schemaObj['max'])) {
              throw new WrongSchemaError('field attr (max) expect integer!');
            }
            break;
          case 'object':
            if (schemaObj.hasOwnProperty('fields')) {
              const fields = schemaObj['fields'];
              if (!this.#isObj(fields)) {
                throw new WrongSchemaError('fields defined but not an object!');
              }
              for (let k in fields) {
                let v = fields[k];
                this.checkSchema(v);
              }
            }

            break;
          default:
            throw new WrongSchemaError('unknown type!');
        }
      } else {
        throw new WrongSchemaError('type is not defined!');
      }
    } else {
      throw new WrongSchemaError('schema is not an object!');
    }
    return true;
  }

  #validateString(schema, param) {
    if (typeof param === 'string') {
    } else {
      throw {name: 'ValidationError'};
    }

    param = param.trim()
    let min = this.#getOrDef(schema, 'min', 0);
    let max = this.#getOrDef(schema, 'max', 2_147_483_647);
    let len = param.length;
    if (len < min || len > max) {
      throw {name: 'ValidationError'};
    }
    if (schema.hasOwnProperty('regex')) {
      let regex = new RegExp(schema['regex']);
      if (!regex.test(param)) {
        throw {name: 'ValidationError'};
      }
    }

    return param;
  }

  #validateInt(schema, param) {
    if (Number.isInteger(param)) {
    } else if (typeof param === 'string') {
      let re = /\d+/g
      if (re.test(param)) {
        param = parseInt(param);
      }
    } else {
      throw {name: 'ValidationError'};
    }

    let min = this.#getOrDef(schema, 'min', -2_147_483_648);
    let max = this.#getOrDef(schema, 'max', 2_147_483_647);
    if (param < min || param > max) {
      throw {name: 'ValidationError'};
    }
    return param;
  }

  #validate0(schema, param) {
    if (param == null) {
      const required = !!this.#getOrDef(schema, 'required', true);
      if (!required) {
        return undefined;
      }
      throw {name: 'ValidationError'};
    }

    switch (schema['type']) {
      case 'string':
        return this.#validateString(schema, param);
      case 'int':
        return this.#validateInt(schema, param);
      case 'object':

        const obj = {};
        const fields = schema['fields'];
        for (let name in fields) {
          const subSchema = fields[name];
          obj[name] = this.#validate0(subSchema, param[name]);
        }

        const additionalField = this.#getOrDef(schema, 'additionalField', true);
        if (!additionalField) {
          for (let k in param) {
            if (!fields.hasOwnProperty(k)) {
              throw {name: 'ValidationError'};
            }
          }
        }
        return obj;
    }
  }

  validate(param) {
    return this.#validate0(this.schema, param);
  }
}

export default Validator;
