class Hash
  #take keys of hash and transform those to a symbols
  def keys_to_sym
    hash = self.inject({}){|memo,(k,v)| memo[k.to_sym] = v.is_a?(Hash) ? v.keys_to_sym : v; memo}
    return hash
  end

  def keys_to_int
    hash = self.inject({}){|memo,(k,v)| memo[k.to_i] = v.is_a?(Hash) ? v.keys_to_sym : v; memo}
    return hash
  end

end
