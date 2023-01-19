module.exports = function(plop) {
  const addAction = (template, filename) => {
    return {
      type: 'add',
      path: `src/components/${filename}`,
      templateFile: `templates/${template}`,
    }
  }
  const addAtomic = (type, desciption) => {
    plop.setGenerator(type, {
      description: desciption,
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: `What is your ${type}'s name?`
        },
      ],
      actions: [
        addAction(`atom.tsx.hbs`, `${type}s/{{pascalCase name}}.tsx`),
        addAction(`atom.module.scss.hbs`, `${type}s/{{pascalCase name}}.module.scss`),
      ],
    })
  }
  addAtomic(`atom`, `Create an atom, the smallest component`);
  addAtomic('molecule', `Create a molecule, a functional component`);
  addAtomic('organism', `Create an organism, toolbar/pages/sidebar`);
  addAtomic('template', `Create a page template`);
  addAtomic('page', `Create a page template`);
};