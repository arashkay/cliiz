var cliiz = $.namespace();

cliiz.i18n = $.namespace(
  { 
    close: "<%=t'close', :default =>'close'%>",
    start: "<%=t('wizard.tips.start', :default =>'Click here to start!').html_safe%>",
    addModule: "<%=t('wizard.tips.add_module', :default =>'click here!').html_safe%>",
    addMoreModule: "<%=t('wizard.tips.add_more_module', :default =>'click here!').html_safe%>",
    swapModules: "<%=t('wizard.tips.swap_modules', :default =>'click here!').html_safe%>",
    swapPages: "<%=t('wizard.tips.swap_pages', :default =>'click here!').html_safe%>",
    maxOfModules: "<%=t('wizard.tips.max_of_modules', :default =>'reached maximum!').html_safe%>"
  }
);

cliiz.defaults = $.namespace(
  {
    selectedModule: ['sitebuilder'],
    modWidth: 702,
    modCount: <%=Component.count%>,
    layoutWidth: 144,
    layoutCount: Math.ceil(<%=Frame.count( :conditions => { :is_private => false})%>/1)
  }
);
