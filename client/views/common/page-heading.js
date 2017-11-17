Template.pageHeading.helpers({

    // Route for Home link in breadcrumbs
    home: 'dashboard',
    students(){
        return {name: "Список студеентов", href: "/students"}
    },
    dictionary(){
      return {name: "Справочники", href: "#"}
    }
});