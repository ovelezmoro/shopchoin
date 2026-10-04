package pe.edu.upn.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upn.dto.CategoryDto;
import pe.edu.upn.entity.Category;
import pe.edu.upn.repository.CategoryRepository;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService {
    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) { this.categories = categories; }

    public List<CategoryDto> findAll() {
        List<CategoryDto> result = new ArrayList<>();
        for (Category category : categories.findAll()) result.add(new CategoryDto(category));
        return result;
    }

    @Transactional
    public CategoryDto create(CategoryDto data) {
        Category category = new Category();
        category.setName(data.getName().trim());
        return new CategoryDto(categories.save(category));
    }
}
